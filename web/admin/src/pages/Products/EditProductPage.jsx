import React from 'react';
import { useParams } from 'react-router-dom';
import ProductEditor from './ProductEditor';

const EditProductPage = () => {
  const { id } = useParams();
  return <ProductEditor mode="edit" productId={id || null} />;
};

export default EditProductPage;
