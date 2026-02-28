import React, { useState, useEffect } from 'react';
import { FiMapPin, FiTruck, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Orders/AllOrdersPage.css';

const TrackingPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const ordersResponse = await apiClient.getOrders();
      const deliveriesData = ordersResponse.data?.filter(o => o.status !== 'cancelled' && o.status !== 'pending') || [];
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingStatus = (status) => {
    const statuses = {
      processing: { icon: FiPackage, label: 'Preparing', color: '#3B82F6' },
      shipped: { icon: FiTruck, label: 'In Transit', color: '#8B5CF6' },
      out_for_delivery: { icon: FiMapPin, label: 'Out for Delivery', color: '#F59E0B' },
      delivered: { icon: FiCheckCircle, label: 'Delivered', color: '#10B981' },
    };
    return statuses[status] || statuses.processing;
  };

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.status === 'shipped' || d.status === 'out_for_delivery').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  };

  if (loading) {
    return <div className="all-orders-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="all-orders-page tracking-page">
      <div className="page-header">
        <div>
          <h1><FiTruck /> Delivery Tracking</h1>
          <p>Real-time tracking of all deliveries</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <FiPackage className="stat-icon" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Active Deliveries</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTruck className="stat-icon processing" />
          <div className="stat-details">
            <h3>{stats.inTransit}</h3>
            <p>In Transit</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon delivered" />
          <div className="stat-details">
            <h3>{stats.delivered}</h3>
            <p>Delivered Today</p>
          </div>
        </div>
      </div>

      <div className="tracking-grid">
        {deliveries.map(delivery => {
          const tracking = getTrackingStatus(delivery.status);
          const Icon = tracking.icon;
          return (
            <div key={delivery._id} className="tracking-card">
              <div className="tracking-header">
                <div className="tracking-icon" style={{ background: tracking.color }}>
                  <Icon />
                </div>
                <div>
                  <h3>{delivery.orderNumber}</h3>
                  <span className="tracking-status" style={{ color: tracking.color }}>
                    {tracking.label}
                  </span>
                </div>
              </div>
              <div className="tracking-details">
                <div className="detail-row">
                  <strong>Customer:</strong> {delivery.userId?.name || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Driver:</strong> {delivery.driverId?.name || 'Unassigned'}
                </div>
                <div className="detail-row">
                  <FiMapPin style={{ color: tracking.color }} />
                  <span>{delivery.deliveryAddress?.city || 'No address'}</span>
                </div>
                <div className="detail-row">
                  <FiClock />
                  <span>Est: {delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toLocaleTimeString() : 'TBD'}</span>
                </div>
              </div>
              <button className="btn-primary">Track Live</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingPage;
