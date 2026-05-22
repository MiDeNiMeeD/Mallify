import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Loader2, ShieldCheck, Star, Truck } from 'lucide-react';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';
import './ViewProduct.css';

const normalizeProductResponse = (response) => {
  if (!response) {
    return null;
  }
  if (response.data) {
    if (response.data.product) {
      return response.data.product;
    }
    if (Array.isArray(response.data)) {
      return response.data[0] || null;
    }
    return response.data;
  }
  if (response.product) {
    return response.product;
  }
  return response;
};

const collectProductImages = (input) => {
  const product = input || {};
  const collections = [
    product.images,
    product.galleryImages,
    product.gallery,
    product.media?.images,
    product.media?.gallery,
    product.media?.items,
    product.assets?.images,
    product.assets?.gallery,
    product.photos,
    product.pictures,
  ];

  const singles = [
    product.image,
    product.imageUrl,
    product.thumbnail,
    product.thumbnailUrl,
    product.featuredImage,
    product.coverImage,
    product.primaryImage,
  ];

  const urls = [];
  const append = (value) => {
    if (!value) {
      return;
    }
    const url = typeof value === 'string'
      ? value
      : value.url || value.href || value.src || value.path || value.imageUrl || null;
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  };

  collections.forEach((collection) => {
    if (Array.isArray(collection)) {
      collection.forEach(append);
    }
  });

  singles.forEach(append);

  if (!urls.length && product.thumbnail) {
    urls.push(product.thumbnail);
  }

  return urls;
};

const buildVariantMatrices = (input) => {
  const product = input || {};
  const colors = [];
  const sizesByColor = {};
  const fallbackSizesSet = new Set();
  const variantSummaries = [];

  const ensureNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeSizeEntries = (variant) => {
    const attributes = variant.attributes || {};
    const matrix = Array.isArray(attributes.SizeMatrix) ? attributes.SizeMatrix : [];
    if (matrix.length) {
      return matrix
        .map((entry) => {
          const label = String(entry.label ?? entry.size ?? entry.name ?? '')?.trim();
          if (!label) {
            return null;
          }
          return {
            label,
            quantity: ensureNumber(entry.quantity ?? entry.qty ?? entry.stock ?? entry.inventory ?? 0),
          };
        })
        .filter(Boolean);
    }

    const fallbackLabel = attributes.Size || attributes.size || '';
    if (fallbackLabel) {
      return [{ label: fallbackLabel, quantity: ensureNumber(variant.quantity ?? variant.stock ?? 0) }];
    }

    return [];
  };

  (product.variants || []).forEach((variant, index) => {
    const attributes = variant.attributes || {};
    const colorName = attributes.Color || attributes.color || '';
    const colorHex = attributes.ColorHex || attributes.colorHex || '';
    const colorIdBase = colorName || colorHex || variant.sku || variant.id;
    const colorId = colorIdBase || `color-${index}`;
    const swatchImage = variant.images?.[0] || variant.thumbnail || null;

    const normalizedSizes = normalizeSizeEntries(variant);
    if (!normalizedSizes.length) {
      normalizedSizes.push({ label: 'One Size', quantity: ensureNumber(variant.quantity ?? 0) });
    }

    normalizedSizes.forEach((sizeEntry) => {
      fallbackSizesSet.add(sizeEntry.label);
    });

    if (!sizesByColor[colorId]) {
      sizesByColor[colorId] = new Set();
    }
    normalizedSizes.forEach((sizeEntry) => {
      sizesByColor[colorId].add(sizeEntry.label);
    });

    const hasColorInfo = colorName || colorHex;
    const alreadyTracked = colors.some((entry) => entry.id === colorId);
    if (hasColorInfo && !alreadyTracked) {
      colors.push({
        id: colorId,
        name: colorName || 'Color option',
        hex: colorHex || null,
        swatchImage,
      });
    }

    const variantPrice = typeof variant.price === 'number'
      ? variant.price
      : ensureNumber(product.price);

    variantSummaries.push({
      id: variant._id || variant.id || variant.sku || `variant-${index}`,
      colorId,
      sku: variant.sku,
      colorName: colorName || 'Default',
      colorHex: colorHex || null,
      swatchImage,
      price: variantPrice,
      sizes: normalizedSizes,
    });
  });

  const normalizedSizes = Object.fromEntries(
    Object.entries(sizesByColor).map(([key, sizeSet]) => [key, Array.from(sizeSet)])
  );

  return {
    colors,
    sizesByColor: normalizedSizes,
    fallbackSizes: Array.from(fallbackSizesSet),
    variantSummaries,
  };
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '0.00 DT';
  }
  return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} DT`;
};

function ViewProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const images = useMemo(() => collectProductImages(product), [product]);
  const heroImage = images[selectedImageIndex] || images[0];

  const variantMatrices = useMemo(() => buildVariantMatrices(product), [product]);
  const colorOptions = variantMatrices.colors.length
    ? variantMatrices.colors
    : product?.attributes?.Color
      ? [{ id: 'default-color', name: product.attributes.Color, hex: product.attributes.ColorHex || null }]
      : [];
  const variantSummaries = variantMatrices.variantSummaries || [];

  const selectedVariant = useMemo(() => {
    if (!variantSummaries.length) {
      return null;
    }

    const normalizedSize = (selectedSize || '').trim().toLowerCase();
    const scopedByColor = selectedColorId
      ? variantSummaries.filter((variant) => variant.colorId === selectedColorId)
      : variantSummaries;

    const sizedMatch = scopedByColor.find((variant) => {
      if (!normalizedSize) {
        return true;
      }
      return variant.sizes.some(
        (sizeEntry) => sizeEntry.label && sizeEntry.label.trim().toLowerCase() === normalizedSize
      );
    });

    if (sizedMatch) {
      return sizedMatch;
    }

    if (scopedByColor.length) {
      return scopedByColor[0];
    }

    return variantSummaries[0];
  }, [variantSummaries, selectedColorId, selectedSize]);

  const availableSizes = useMemo(() => {
    if (selectedColorId && variantMatrices.sizesByColor[selectedColorId]?.length) {
      return variantMatrices.sizesByColor[selectedColorId];
    }
    if (variantMatrices.fallbackSizes.length) {
      return variantMatrices.fallbackSizes;
    }
    if (product?.attributes?.Size) {
      return [product.attributes.Size];
    }
    return ['One Size'];
  }, [selectedColorId, variantMatrices, product]);

  useEffect(() => {
    if (!colorOptions.length) {
      return;
    }
    if (!selectedColorId) {
      setSelectedColorId(colorOptions[0].id);
    }
  }, [colorOptions, selectedColorId]);

  useEffect(() => {
    if (!availableSizes.length) {
      setSelectedSize('');
      return;
    }
    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!productId) {
        setError('Missing product identifier.');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        let productData = location.state?.product;
        const normalizedState = normalizeProductResponse(productData);
        if (!normalizedState || (normalizedState._id || normalizedState.id) !== productId) {
          const response = await apiClient.getProductById(productId);
          productData = normalizeProductResponse(response);
        } else {
          productData = normalizedState;
        }

        if (!productData) {
          throw new Error('Product not found.');
        }

        if (isMounted) {
          setProduct(productData);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error('Failed to load product details.', err);
        if (isMounted) {
          setError(err.message || 'Unable to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, location.state]);

  const handleAddToCart = () => {
    showToast('Added to cart. This is a preview experience.', 'success');
  };

  const handleFavorite = () => {
    showToast('Saved to favorites.', 'info');
  };

  if (loading) {
    return (
      <div className="product-view-page product-view-page--centered">
        <Loader2 size={32} className="spin" />
        <p className="product-view__loading-text">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-view-page product-view-page--centered">
        <p className="product-view__error-text">{error || 'Product unavailable.'}</p>
        <button className="pv-button pv-button--ghost" onClick={() => navigate('/products')}>
          Go back
        </button>
      </div>
    );
  }

  const rating = Number(product.rating || product.averageRating || 4.8).toFixed(1);
  const reviewCount = product.reviewCount || product.reviews?.length || 32;
  const basePriceValue = Number(product.price) || 0;
  const displayedPriceValue = selectedVariant?.price ?? basePriceValue;
  const price = formatCurrency(displayedPriceValue);
  const compareAt = product.compareAtPrice ? formatCurrency(Number(product.compareAtPrice)) : null;
  const brand = product.brand || product.boutique?.name || 'Mallify Boutique';

  return (
    <div className="product-view-page">
      <button className="pv-back-link" onClick={() => navigate('/products')}>
        <ArrowLeft size={18} />
        Back to products
      </button>

      <div className="product-view">
        <div className="product-view__gallery">
          <div className="product-view__hero">
            {heroImage ? (
              <img src={heroImage} alt={product.name} />
            ) : (
              <div className="product-view__hero--placeholder">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-view__thumbnails" role="list">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  role="listitem"
                  className={`product-view__thumb ${index === selectedImageIndex ? 'product-view__thumb--active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-view__details">
          <p className="product-view__brand">{brand}</p>
          <h1 className="product-view__title">{product.name}</h1>
          <div className="product-view__section">
            <h2 className="product-view__section-heading">Product Details</h2>
            <p className="product-view__description">{product.description || 'No description provided yet.'}</p>
            {product.attributes && (
              <dl className="product-view__specs">
                {Object.entries(product.attributes)
                  .filter(([key]) => key !== 'categoryLabel')
                  .map(([key, value]) => (
                    <div key={key} className="product-view__spec-item">
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
          

         

          {colorOptions.length > 0 && (
            <div className="product-view__section">
              <div className="product-view__section-label">Color</div>
              <div className="product-view__swatches">
                {colorOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`product-view__swatch ${option.id === selectedColorId ? 'product-view__swatch--active' : ''}`}
                    onClick={() => setSelectedColorId(option.id)}
                    title={option.name}
                  >
                    {option.swatchImage ? (
                      <img src={option.swatchImage} alt={option.name} />
                    ) : (
                      <span
                        style={{ backgroundColor: option.hex || '#e5e7eb' }}
                        className="product-view__swatch-color"
                      />
                    )}
                    {option.id === selectedColorId && <Check size={16} className="product-view__swatch-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-view__section">
            <div className="product-view__section-label">Size</div>
            <div className="product-view__sizes">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`product-view__size ${size === selectedSize ? 'product-view__size--active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button className="product-view__size-guide" type="button">See guide</button>
          </div>
 <div className="product-view__price-row">
            <span className="product-view__price">{price}</span>
            {compareAt && <span className="product-view__compare">{compareAt}</span>}
          </div>
          <div className="product-view__rating-row">
            <Star size={16} fill="#facc15" stroke="#fbbf24" />
            <span>{rating}</span>
            <span className="product-view__rating-count">({reviewCount} reviews)</span>
          </div>
          <div className="product-view__cta-row">
            <button className="pv-button pv-button--primary" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button className="pv-button pv-button--ghost" onClick={handleFavorite}>
              <Heart size={18} />
            </button>
          </div>
 <ul className="product-view__advantages">
            <li>
              <Truck size={18} />
              Free delivery on orders over 80 DT
            </li>
            <li>
              <ShieldCheck size={18} />
              Secure checkout & buyer protection
            </li>
          </ul>
          {variantSummaries.length > 0 && (
            <div className="product-view__section product-view__variant-section">
              <div className="product-view__section-label">Variant availability</div>
              <div className="product-view__variant-grid">
                {variantSummaries.map((variantInfo) => (
                  <div key={variantInfo.id} className="product-view__variant-card">
                    <div className="product-view__variant-card-top">
                      <div className="product-view__variant-color">
                        {(variantInfo.swatchImage || variantInfo.colorHex) && (
                          <span
                            className="product-view__variant-color-chip"
                            style={{ backgroundImage: variantInfo.swatchImage ? `url(${variantInfo.swatchImage})` : undefined, backgroundColor: variantInfo.swatchImage ? undefined : (variantInfo.colorHex || '#e5e7eb') }}
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <div className="product-view__variant-color-name">{variantInfo.colorName}</div>
                          {variantInfo.sku && (
                            <div className="product-view__variant-sku">SKU: {variantInfo.sku}</div>
                          )}
                        </div>
                      </div>
                      <div className="product-view__variant-price">{formatCurrency(variantInfo.price)}</div>
                    </div>
                    <div className="product-view__variant-sizes">
                      {variantInfo.sizes.map((sizeEntry) => (
                        <div key={`${variantInfo.id}-${sizeEntry.label}`} className="product-view__variant-size">
                          <span>{sizeEntry.label}</span>
                          <span className="product-view__variant-size-qty">Qty: {sizeEntry.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

         

          
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}

export default ViewProduct;
