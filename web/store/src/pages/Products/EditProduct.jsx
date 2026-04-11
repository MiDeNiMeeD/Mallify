import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Upload, X, Save, FileText, Loader2, AlertCircle, Check } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../Dashboard/Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';

const INITIAL_FORM_STATE = {
  name: '',
  category: '',
  price: '',
  comparePrice: '',
  stock: '',
  sku: '',
  barcode: '',
  description: '',
  status: 'active',
  lowStockThreshold: '10',
  tags: '',
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const getInitialAttributeRows = () => [{ key: '', value: '' }];

const ensureString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
};

const COLOR_OPTIONS = [
  { label: 'Black', value: '#111827' },
  { label: 'White', value: '#F9FAFB' },
  { label: 'Gray', value: '#9CA3AF' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#FACC15' },
  { label: 'Green', value: '#10B981' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
];

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];

const DEFAULT_CUSTOM_COLOR = '#111827';
const COLOR_HEX_PATTERN = /^#(?:[0-9a-f]{3}){1,2}$/i;

const createSizeRow = (label = '', quantity = '') => ({
  id: generateId(),
  label,
  quantity,
});

const getColorLabelByHex = (hex) => {
  if (!hex) {
    return '';
  }
  const match = COLOR_OPTIONS.find((option) => option.value.toLowerCase() === hex.toLowerCase());
  return match ? match.label : '';
};

const splitVariantAttributes = (attributes = {}) => {
  const rows = [];
  let colorValue = '';
  let colorName = '';
  let sizeMatrix = [];
  let legacySizeValue = '';

  Object.entries(attributes || {}).forEach(([key, rawValue]) => {
    if (!key) {
      return;
    }
    const normalizedKey = key.toLowerCase();
    const value = ensureString(rawValue);

    if (normalizedKey === 'color' || normalizedKey === 'colour') {
      colorName = value;
      const paletteMatch = COLOR_OPTIONS.find((option) => option.label.toLowerCase() === value.toLowerCase());
      if (paletteMatch) {
        colorValue = paletteMatch.value;
      } else if (COLOR_HEX_PATTERN.test(value)) {
        colorValue = value;
      }
      return;
    }

    if (normalizedKey === 'colorhex') {
      if (COLOR_HEX_PATTERN.test(value)) {
        colorValue = value;
      }
      return;
    }

    if (normalizedKey === 'sizematrix') {
      if (Array.isArray(rawValue)) {
        sizeMatrix = rawValue;
      }
      return;
    }

    if (normalizedKey === 'sizes') {
      return;
    }

    if (normalizedKey === 'size') {
      legacySizeValue = value;
      return;
    }

    rows.push({ key, value });
  });

  if (!rows.length) {
    rows.push({ key: '', value: '' });
  }

  if (!colorName && colorValue) {
    colorName = getColorLabelByHex(colorValue) || colorValue;
  }

  return { rows, colorValue, colorName, sizeMatrix, legacySizeValue };
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const createVariantTemplate = () => ({
  id: generateId(),
  name: '',
  sku: '',
  price: '',
  comparePrice: '',
  attributes: getInitialAttributeRows(),
  colorValue: '',
  colorName: '',
  sizePreset: '',
  customSize: '',
  sizes: [createSizeRow()],
});

const getVariantSizeTotal = (variant = {}) => {
  return (variant.sizes || []).reduce(
    (sum, sizeRow) => sum + Math.max(0, Math.round(toNumber(sizeRow.quantity))),
    0
  );
};

const normalizeAttributeRows = (rows = []) => {
  return rows.reduce((acc, row) => {
    const key = row.key?.trim();
    if (!key) {
      return acc;
    }
    acc[key] = row.value;
    return acc;
  }, {});
};

const objectAttributesToRows = (attributes = {}) => {
  const entries = Object.entries(attributes || {})
    .filter(([key]) => key && key !== 'categoryLabel');
  if (!entries.length) {
    return getInitialAttributeRows();
  }
  return entries.map(([key, value]) => ({ key, value: ensureString(value) }));
};

const buildSizeRowsFromVariant = (variant = {}, parsedAttributes = {}) => {
  const sourceMatrix = Array.isArray(parsedAttributes.sizeMatrix) ? parsedAttributes.sizeMatrix : null;
  if (sourceMatrix && sourceMatrix.length) {
    return sourceMatrix.map((entry) =>
      createSizeRow(
        ensureString(entry.label ?? entry.size ?? ''),
        ensureString(entry.quantity ?? entry.qty ?? '')
      )
    );
  }

  const legacyLabel = parsedAttributes.legacySizeValue || ensureString(variant.size ?? variant.attributes?.size ?? '');
  const legacyQuantity = ensureString(variant.quantity ?? variant.stock ?? '');
  if (legacyLabel || legacyQuantity) {
    return [createSizeRow(legacyLabel, legacyQuantity)];
  }

  return [createSizeRow()];
};

const convertVariantsToState = (variants = []) => {
  if (!Array.isArray(variants) || !variants.length) {
    return [];
  }
  return variants.map((variant) => {
    const parsed = splitVariantAttributes(variant.attributes);
    return {
      id: generateId(),
      name: ensureString(variant.name),
      sku: ensureString(variant.sku),
      price: ensureString(variant.price ?? ''),
      comparePrice: ensureString(variant.compareAtPrice ?? variant.compare_price ?? ''),
      attributes: parsed.rows,
      colorValue: parsed.colorValue,
      colorName: parsed.colorName,
      sizePreset: '',
      customSize: '',
      sizes: buildSizeRowsFromVariant(variant, parsed),
    };
  });
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

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

const getProductImages = (product = {}) => {
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
  const addUrl = (value) => {
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
      collection.forEach(addUrl);
    }
  });

  singles.forEach(addUrl);

  if (!urls.length && product.thumbnail) {
    urls.push(product.thumbnail);
  }

  return urls;
};

const buildImageStateFromProduct = (product = {}) => {
  const sources = getProductImages(product);
  if (!sources.length) {
    return [];
  }
  return sources.map((src, index) => ({
    id: generateId(),
    name: `${product.name || 'product'}-image-${index + 1}`,
    data: src,
  }));
};

const getProductCategoryValue = (product = {}) => {
  if (product.category) {
    return product.category;
  }
  if (product.attributes?.categoryLabel) {
    return product.attributes.categoryLabel;
  }
  return '';
};

const getProductQuantityValue = (product = {}) => {
  if (typeof product.quantity === 'number') {
    return product.quantity;
  }
  if (typeof product.stock === 'number') {
    return product.stock;
  }
  if (typeof product.inventory === 'number') {
    return product.inventory;
  }
  return '';
};

function EditProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const formId = 'edit-product-form';

  const [originalProduct, setOriginalProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [images, setImages] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [attributeRows, setAttributeRows] = useState(() => getInitialAttributeRows());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const variantInventoryTotal = useMemo(
    () => variants.reduce((sum, variant) => sum + getVariantSizeTotal(variant), 0),
    [variants]
  );

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const hydrateFromProduct = useCallback((product) => {
    setFormData({
      name: product.name || '',
      category: getProductCategoryValue(product),
      price: ensureString(product.price ?? ''),
      comparePrice: ensureString(product.compareAtPrice ?? product.compare_price ?? ''),
      stock: product.hasVariants ? '' : ensureString(getProductQuantityValue(product)),
      sku: product.sku || '',
      barcode: ensureString(product.barcode ?? ''),
      description: product.description || '',
      status: product.status || 'active',
      lowStockThreshold: ensureString(product.lowStockThreshold ?? '10'),
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : ensureString(product.tags),
    });

    const attributeRowsData = objectAttributesToRows(product.attributes);
    setAttributeRows(attributeRowsData);

    const preparedVariants = convertVariantsToState(product.variants || []);
    setVariants(preparedVariants.length ? preparedVariants : []);
    setHasVariants(preparedVariants.length > 0 || Boolean(product.hasVariants));

    const hydratedImages = buildImageStateFromProduct(product);
    setImages(hydratedImages);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!productId) {
        setFetchError('Missing product identifier.');
        setLoading(false);
        return;
      }

      try {
        setFetchError(null);
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
          hydrateFromProduct(productData);
          setOriginalProduct(productData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load product.', error);
        if (isMounted) {
          setFetchError(error.message || 'Unable to load product.');
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [productId, location.state, hydrateFromProduct]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      showToast(`You can upload up to ${MAX_IMAGES} images per product.`, 'warning');
      return;
    }

    const eligibleFiles = [];
    let invalidTypeCount = 0;
    let oversizeCount = 0;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidTypeCount += 1;
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        oversizeCount += 1;
        return;
      }
      eligibleFiles.push(file);
    });

    if (invalidTypeCount) {
      showToast('Only image files are supported.', 'warning');
    }

    if (oversizeCount) {
      showToast(`Images must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`, 'warning');
    }

    if (!eligibleFiles.length) {
      return;
    }

    const filesToProcess = eligibleFiles.slice(0, remainingSlots);
    if (eligibleFiles.length > remainingSlots) {
      showToast(`Only ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} can be added (max ${MAX_IMAGES}).`, 'info');
    }

    try {
      const uploadResponse = await apiClient.uploadProductImages(filesToProcess);
      const uploadedImages = uploadResponse?.data?.images || [];

      if (!uploadedImages.length) {
        throw new Error('No uploaded images returned from server.');
      }

      const processed = uploadedImages.map((image) => ({
        id: generateId(),
        name: image.originalName || image.filename || 'product-image',
        data: image.url,
      }));

      setImages((prev) => [...prev, ...processed]);
      if (e.target) {
        e.target.value = '';
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Unable to upload images. Please try again.', 'error');
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleAttributeChange = (index, field, value) => {
    setAttributeRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  };

  const addAttributeRow = () => {
    setAttributeRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeAttributeRow = (index) => {
    setAttributeRows((prev) => {
      if (prev.length === 1) {
        return getInitialAttributeRows();
      }
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleVariantToggle = (event) => {
    const enabled = event.target.checked;
    setHasVariants(enabled);
    if (enabled && variants.length === 0) {
      setVariants([createVariantTemplate()]);
    }
    if (!enabled) {
      setVariants([]);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, createVariantTemplate()]);
  };

  const removeVariant = (variantId) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
  };

  const updateVariantField = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  };

  const addVariantAttribute = (variantId) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, attributes: [...variant.attributes, { key: '', value: '' }] }
          : variant
      )
    );
  };

  const updateVariantAttribute = (variantId, attrIndex, field, value) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        const updatedAttributes = variant.attributes.map((attr, index) =>
          index === attrIndex ? { ...attr, [field]: value } : attr
        );
        return { ...variant, attributes: updatedAttributes };
      })
    );
  };

  const removeVariantAttribute = (variantId, attrIndex) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        if (variant.attributes.length === 1) {
          return { ...variant, attributes: getInitialAttributeRows() };
        }
        return {
          ...variant,
          attributes: variant.attributes.filter((_, index) => index !== attrIndex),
        };
      })
    );
  };

  const addVariantSize = (variantId, label = '', quantity = '') => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, sizes: [...(variant.sizes || []), createSizeRow(label, quantity)] }
          : variant
      )
    );
  };

  const updateVariantSizeField = (variantId, sizeId, field, value) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        const sizes = (variant.sizes || []).map((sizeRow) =>
          sizeRow.id === sizeId ? { ...sizeRow, [field]: value } : sizeRow
        );
        return { ...variant, sizes };
      })
    );
  };

  const removeVariantSize = (variantId, sizeId) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        const remaining = (variant.sizes || []).filter((sizeRow) => sizeRow.id !== sizeId);
        return { ...variant, sizes: remaining.length ? remaining : [createSizeRow()] };
      })
    );
  };

  const applyPresetSizes = (variantId) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        const existingLabels = new Set(
          (variant.sizes || [])
            .map((sizeRow) => (sizeRow.label || '').trim().toLowerCase())
            .filter(Boolean)
        );
        const additions = SIZE_PRESETS.filter((size) => !existingLabels.has(size.toLowerCase()))
          .map((size) => createSizeRow(size, ''));
        if (!additions.length) {
          return variant;
        }
        return { ...variant, sizes: [...variant.sizes, ...additions] };
      })
    );
    showToast('Added missing preset sizes to this variant.', 'info');
  };

  const appendSizeLabelToVariant = (variantId, label) => {
    const normalized = label?.trim();
    if (!normalized) {
      return 'empty';
    }

    let status = 'noop';
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }
        const existingLabels = new Set(
          (variant.sizes || [])
            .map((sizeRow) => (sizeRow.label || '').trim().toLowerCase())
            .filter(Boolean)
        );
        if (existingLabels.has(normalized.toLowerCase())) {
          status = 'duplicate';
          return variant;
        }
        status = 'added';
        return {
          ...variant,
          sizePreset: '',
          customSize: '',
          sizes: [...(variant.sizes || []), createSizeRow(normalized, '')],
        };
      })
    );

    return status;
  };

  const handleVariantColorSelect = (variantId, colorValue, colorLabel) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              colorValue,
              colorName: colorLabel || getColorLabelByHex(colorValue) || colorValue,
            }
          : variant
      )
    );
  };

  const handleVariantCustomColor = (variantId, colorValue) => {
    handleVariantColorSelect(variantId, colorValue, colorValue);
  };

  const clearVariantColor = (variantId) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, colorValue: '', colorName: '' }
          : variant
      )
    );
  };

  const handleVariantSizeSelect = (variantId, value) => {
    if (value === '__custom') {
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId ? { ...variant, sizePreset: '__custom', customSize: '' } : variant
        )
      );
      return;
    }

    if (!value) {
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId ? { ...variant, sizePreset: '', customSize: '' } : variant
        )
      );
      return;
    }

    const status = appendSizeLabelToVariant(variantId, value);
    if (status === 'duplicate') {
      showToast(`${value} is already in the size list for this variant.`, 'warning');
    } else if (status === 'added') {
      showToast(`Added ${value} to this variant.`, 'info');
    }
  };

  const handleVariantCustomSizeChange = (variantId, value) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, sizePreset: '__custom', customSize: value }
          : variant
      )
    );
  };

  const handleAddCustomSizeOption = (variantId) => {
    const target = variants.find((variant) => variant.id === variantId);
    if (!target) {
      return;
    }
    const label = target.customSize?.trim() || '';
    if (!label) {
      showToast('Enter a custom size label first.', 'warning');
      return;
    }
    const status = appendSizeLabelToVariant(variantId, label);
    if (status === 'duplicate') {
      showToast(`${label} is already in the size list for this variant.`, 'warning');
      return;
    }
    if (status === 'added') {
      showToast(`Added custom size ${label}.`, 'info');
    }
  };

  const buildVariantPayload = () => {
    const errors = [];
    const payload = [];

    variants.forEach((variant, index) => {
      const name = variant.name.trim();
      const sku = variant.sku.trim();
      const priceValue = variant.price !== '' ? toNumber(variant.price) : undefined;
      const compareAtPriceValue = variant.comparePrice !== '' ? toNumber(variant.comparePrice) : undefined;

      if (!name || !sku) {
        errors.push(`Variant ${index + 1} needs both a name and SKU.`);
        return;
      }

      if (priceValue !== undefined && priceValue < 0) {
        errors.push(`Variant ${index + 1} price cannot be negative.`);
        return;
      }

      if (compareAtPriceValue !== undefined && compareAtPriceValue < 0) {
        errors.push(`Variant ${index + 1} compare at price cannot be negative.`);
        return;
      }

      if (
        compareAtPriceValue !== undefined &&
        priceValue !== undefined &&
        compareAtPriceValue < priceValue
      ) {
        errors.push(`Variant ${index + 1} compare at price should be greater than or equal to variant price.`);
        return;
      }

      const normalizedSizes = (variant.sizes || []).map((sizeRow, sizeIndex) => {
        const label = sizeRow.label?.trim() || '';
        const hasQuantity = sizeRow.quantity !== '' && sizeRow.quantity !== null && sizeRow.quantity !== undefined;
        const quantityValue = hasQuantity ? toNumber(sizeRow.quantity) : NaN;

        if (!label) {
          errors.push(`Variant ${index + 1}, size ${sizeIndex + 1} needs a label.`);
          return null;
        }

        if (!hasQuantity || !Number.isFinite(quantityValue) || quantityValue < 0) {
          errors.push(`Variant ${index + 1}, size ${label} must have a non-negative quantity.`);
          return null;
        }

        return {
          label,
          quantity: Math.max(0, Math.round(quantityValue)),
        };
      }).filter(Boolean);

      if (!normalizedSizes.length) {
        errors.push(`Variant ${index + 1} must include at least one size with quantity.`);
        return;
      }

      const attributePayload = normalizeAttributeRows(variant.attributes);
      if (variant.colorValue || variant.colorName) {
        attributePayload.Color = variant.colorName || variant.colorValue;
        if (variant.colorValue) {
          attributePayload.ColorHex = variant.colorValue;
        }
      }

      attributePayload.SizeMatrix = normalizedSizes;
      attributePayload.Sizes = normalizedSizes.map((entry) => entry.label).join(', ');

      const variantQuantity = normalizedSizes.reduce((sum, entry) => sum + entry.quantity, 0);

      payload.push({
        name,
        sku,
        price: priceValue,
        compareAtPrice: compareAtPriceValue,
        quantity: variantQuantity,
        attributes: attributePayload,
      });
    });

    return { payload, errors };
  };

  const resolveBoutiqueId = () => {
    if (originalProduct?.boutiqueId) {
      return originalProduct.boutiqueId;
    }
    if (originalProduct?.boutique?._id) {
      return originalProduct.boutique._id;
    }
    if (user?.boutiqueList?.[0]) {
      return user.boutiqueList[0];
    }
    return null;
  };

  const submitProduct = async (statusOverride = formData.status) => {
    if (isSubmitting) {
      return;
    }

    if (!productId) {
      showToast('Missing product identifier.', 'error');
      return;
    }

    const boutiqueId = resolveBoutiqueId();
    if (!boutiqueId) {
      showToast('You need an approved boutique before updating products.', 'error');
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedSku = formData.sku.trim();

    if (!trimmedName || !trimmedDescription || !trimmedSku) {
      showToast('Name, description, and SKU are required.', 'error');
      return;
    }

    if (!formData.category) {
      showToast('Choose a category for this product.', 'error');
      return;
    }

    const basePriceProvided = formData.price !== '' && formData.price !== null && formData.price !== undefined;
    const normalizedBasePrice = basePriceProvided ? toNumber(formData.price) : undefined;

    if (basePriceProvided && (Number.isNaN(normalizedBasePrice) || normalizedBasePrice < 0)) {
      showToast('Price must be zero or a positive number.', 'error');
      return;
    }

    if (!hasVariants && !basePriceProvided) {
      showToast('Enter a product price before saving.', 'error');
      return;
    }

    if (formData.comparePrice !== '') {
      const compareAtPriceValue = toNumber(formData.comparePrice);
      if (Number.isNaN(compareAtPriceValue) || compareAtPriceValue < 0) {
        showToast('Compare at price cannot be negative.', 'error');
        return;
      }
    }

    const { payload: rawVariantPayload, errors: variantErrors } = hasVariants
      ? buildVariantPayload()
      : { payload: [], errors: [] };

    if (variantErrors.length) {
      showToast(variantErrors[0], 'error');
      return;
    }

    if (hasVariants && rawVariantPayload.length === 0) {
      showToast('Add at least one variant with a name, SKU, and size quantities.', 'error');
      return;
    }

    const skuSet = new Set([trimmedSku.toLowerCase()]);
    if (hasVariants) {
      const duplicateVariant = rawVariantPayload.find((variant) => {
        const normalizedVariantSku = variant.sku.toLowerCase();
        if (skuSet.has(normalizedVariantSku)) {
          return true;
        }
        skuSet.add(normalizedVariantSku);
        return false;
      });

      if (duplicateVariant) {
        showToast('Variant SKUs must be unique and cannot match the product SKU.', 'error');
        return;
      }
    }

    const variantPrices = rawVariantPayload
      .map((variant) => (typeof variant.price === 'number' ? variant.price : undefined))
      .filter((price) => typeof price === 'number');

    if (hasVariants && !variantPrices.length && !basePriceProvided) {
      showToast('Provide at least one price (either a base price or per variant).', 'error');
      return;
    }

    const fallbackPrice = basePriceProvided
      ? Math.max(0, normalizedBasePrice)
      : Math.max(0, variantPrices[0] ?? 0);

    const finalVariantPayload = hasVariants
      ? rawVariantPayload.map((variant) => ({
          ...variant,
          price: typeof variant.price === 'number' ? variant.price : fallbackPrice,
          compareAtPrice:
            typeof variant.compareAtPrice === 'number'
              ? Math.max(variant.compareAtPrice, (typeof variant.price === 'number' ? variant.price : fallbackPrice))
              : undefined,
        }))
      : [];

    const resolvedPrice = hasVariants
      ? (variantPrices[0] ?? fallbackPrice)
      : Math.max(0, normalizedBasePrice ?? 0);

    const variantsQuantity = finalVariantPayload.reduce((sum, variant) => sum + variant.quantity, 0);
    const baseQuantity = Math.max(0, Math.round(toNumber(formData.stock)));
    const totalQuantity = hasVariants ? variantsQuantity : baseQuantity;

    const attributePayload = normalizeAttributeRows(attributeRows);
    if (formData.category) {
      attributePayload.categoryLabel = formData.category;
    }

    const imagePayload = images.map((image) => image.data);
    const tagsPayload = formData.tags
      ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

    const statusOptions = ['active', 'draft', 'archived', 'suspended'];
    const normalizedStatus = statusOptions.includes(statusOverride) ? statusOverride : 'active';

    const payload = {
      name: trimmedName,
      description: trimmedDescription,
      price: resolvedPrice,
      compareAtPrice: formData.comparePrice !== '' ? toNumber(formData.comparePrice) : undefined,
      sku: trimmedSku,
      barcode: formData.barcode.trim() || undefined,
      quantity: totalQuantity,
      lowStockThreshold: formData.lowStockThreshold
        ? Math.max(0, Math.round(toNumber(formData.lowStockThreshold)))
        : undefined,
      boutiqueId,
      images: imagePayload,
      ...(imagePayload.length ? { thumbnail: imagePayload[0] } : {}),
      hasVariants: hasVariants && finalVariantPayload.length > 0,
      variants: hasVariants ? finalVariantPayload : [],
      attributes: attributePayload,
      tags: tagsPayload,
      status: normalizedStatus,
    };

    setIsSubmitting(true);
    try {
      await apiClient.updateProduct(productId, payload);
      showToast('Product updated successfully.', 'success');
      navigate('/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast(error.message || 'Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProduct(formData.status);
  };

  const handleSaveDraft = () => {
    submitProduct('draft');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="content-card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={20} className="spin" />
            <span>Loading product…</span>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{fetchError}</span>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/products')}>
          Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update your product details and inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', minWidth: 'fit-content' }}>
          <button
            type="submit"
            form={formId}
            className="btn-secondary"
            style={{ width: '100px', height: '46px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Updating product' : 'Update product'}
          >
            {isSubmitting ? <Loader2 size={18} className="spin" /> : <Save size={16} /> }
            Update
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100px', height: '46px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            aria-label="Save draft"
          >
            <FileText size={16} style={{ marginLeft: '-6px' }} /> Draft
          </button>
        </div>
      </div>

      <form id={formId} onSubmit={handleSubmit}>
        <div className="grid-2">
          <div>
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Basic Information</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Floral Dress"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Describe your product in detail..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Comma separated e.g. summer, linen, casual"
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Improve search with descriptive keywords.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Attributes</label>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 0 }}>
                    Add optional key/value pairs (e.g., Material: Cotton, Brand: Mallify).
                  </p>
                  {attributeRows.map((attribute, index) => (
                    <div key={`attr-${index}`} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Attribute name"
                        value={attribute.key}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Value"
                        value={attribute.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => removeAttributeRow(index)}
                        style={{ paddingInline: '0.75rem' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addAttributeRow}
                  >
                    <Plus size={16} /> Add attribute
                  </button>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h2 className="card-title">Variants</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={handleVariantToggle}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                  />
                  Enable size/color variations
                </label>
              </div>
              {hasVariants && (
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {variants.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Add your first variant to specify unique SKUs, prices, and inventory counts.
                    </p>
                  )}
                  {variants.map((variant, index) => (
                    <div key={variant.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Variant {index + 1}</strong>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Variant Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.name}
                            onChange={(e) => updateVariantField(variant.id, 'name', e.target.value)}
                            placeholder="e.g., Red / Small"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Variant SKU *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variant.sku}
                            onChange={(e) => updateVariantField(variant.id, 'sku', e.target.value)}
                            placeholder="e.g., DRS-001-RED-S"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Variant Price</label>
                          <input
                            type="number"
                            className="form-input"
                            value={variant.price}
                            onChange={(e) => updateVariantField(variant.id, 'price', e.target.value)}
                            placeholder="Defaults to base price"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Variant Compare at Price</label>
                          <input
                            type="number"
                            className="form-input"
                            value={variant.comparePrice}
                            onChange={(e) => updateVariantField(variant.id, 'comparePrice', e.target.value)}
                            placeholder="Show strike-through discount"
                            min="0"
                            step="0.01"
                          />
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Show a strike-through price for discounts.
                          </p>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Variant Inventory</label>
                          <input
                            type="number"
                            className="form-input"
                            value={getVariantSizeTotal(variant)}
                            readOnly
                            disabled
                          />
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Totals update automatically based on size quantities below.
                          </p>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Color</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {COLOR_OPTIONS.map((option) => {
                            const isSelected = variant.colorValue === option.value;
                            const iconColor = option.label === 'White' || option.label === 'Yellow'
                              ? '#111827'
                              : '#fff';
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleVariantColorSelect(variant.id, option.value, option.label)}
                                title={option.label}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                  backgroundColor: option.value,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: iconColor,
                                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',
                                }}
                              >
                                {isSelected && <Check size={16} />}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => clearVariantColor(variant.id)}
                          >
                            Clear color
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <input
                            type="color"
                            value={variant.colorValue || DEFAULT_CUSTOM_COLOR}
                            onChange={(e) => handleVariantCustomColor(variant.id, e.target.value)}
                            style={{ width: '48px', height: '32px', padding: 0, border: '1px solid var(--border-color)', borderRadius: '6px' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {variant.colorName || 'Pick a custom color'}
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sizes</label>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                          Choose a preset size to add it to this variant or switch to custom to create your own.
                        </p>
                        <select
                          className="form-select"
                          value={variant.sizePreset === '__custom' ? '__custom' : ''}
                          onChange={(e) => handleVariantSizeSelect(variant.id, e.target.value)}
                        >
                          <option value="">Select size to add…</option>
                          {SIZE_PRESETS.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                          <option value="__custom">Custom size…</option>
                        </select>
                        {variant.sizePreset === '__custom' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Custom size label"
                              value={variant.customSize}
                              onChange={(e) => handleVariantCustomSizeChange(variant.id, e.target.value)}
                              style={{ flex: '1 1 220px' }}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => handleAddCustomSizeOption(variant.id)}
                            >
                              Add custom size
                            </button>
                          </div>
                        )}
                        <div style={{ marginTop: '0.75rem' }}>
                          {(variant.sizes || []).map((sizeRow) => (
                            <div
                              key={sizeRow.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 130px 36px',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Size label"
                                value={sizeRow.label}
                                onChange={(e) => updateVariantSizeField(variant.id, sizeRow.id, 'label', e.target.value)}
                              />
                              <input
                                type="number"
                                className="form-input"
                                placeholder="Qty"
                                min="0"
                                value={sizeRow.quantity}
                                onChange={(e) => updateVariantSizeField(variant.id, sizeRow.id, 'quantity', e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => removeVariantSize(variant.id, sizeRow.id)}
                                aria-label="Remove size"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => addVariantSize(variant.id)}>
                              <Plus size={14} /> Blank row
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => applyPresetSizes(variant.id)}>
                              Fill missing presets
                            </button>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              Total units: {getVariantSizeTotal(variant)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Variant Attributes</label>
                        {variant.attributes.map((attribute, attrIndex) => (
                          <div key={`${variant.id}-attr-${attrIndex}`} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Attribute name (e.g., Size)"
                              value={attribute.key}
                              onChange={(e) => updateVariantAttribute(variant.id, attrIndex, 'key', e.target.value)}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Value (e.g., Small)"
                              value={attribute.value}
                              onChange={(e) => updateVariantAttribute(variant.id, attrIndex, 'value', e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => removeVariantAttribute(variant.id, attrIndex)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => addVariantAttribute(variant.id)}
                        >
                          <Plus size={16} /> Attribute
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-primary" onClick={addVariant}>
                    <Plus size={16} /> Add Variant
                  </button>
                </div>
              )}
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Product Images</h2>
              </div>
              <div className="card-body">
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Click to upload product images</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PNG, JPG up to 5MB each</p>
                  </label>
                </div>
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {images.map((image, index) => (
                      <div key={image.id} style={{ position: 'relative' }}>
                        <img
                          src={image.data}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'var(--danger-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Pricing</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required={!hasVariants}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Compare at Price</label>
                  <input
                    type="number"
                    className="form-input"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Show a strike-through price for discounts
                  </p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Inventory</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="e.g., DRS-001-BLK-M"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode</label>
                  <input
                    type="text"
                    className="form-input"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Optional barcode"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required={!hasVariants}
                    disabled={hasVariants}
                  />
                  {hasVariants && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Inventory is calculated from variant quantities. Current total: {variantInventoryTotal} units.
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Status</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Product Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    defaultChecked={formData.status === 'active'}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary-color)'
                    }}
                  />
                  <label style={{ margin: 0 }}>Publish to storefront immediately</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}

export default EditProduct;
