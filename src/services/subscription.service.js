// frontend/src/services/subscription.service.js
import api from './api';

export const getCurrentSubscription = async () => {
  try {
    const response = await api.get('subscriptions/current/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener la suscripción actual:', error);
    if (error.response && error.response.data) {
      return { active: false, message: error.response.data.message };
    }
    throw error;
  }
};

export const createCheckoutSession = async (planType, successUrl, cancelUrl) => {
  try {
    const response = await api.post(
      'subscriptions/create_checkout_session/', 
      { plan_type: planType, success_url: successUrl, cancel_url: cancelUrl }
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear la sesión de checkout:', error);
    throw error;
  }
};

export const getSubscriptionHistory = async () => {
  try {
    const response = await api.get('subscriptions/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de suscripciones:', error);
    throw error;
  }
};