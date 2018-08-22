/**
 * store.js
 * CrypDeep Payments. Created by Suren Harutyunyan.
 *
 * Representation of products, line items, and orders, and saving them.
 * Please note this is overly simplified class for demo purposes (all products
 * are loaded for convenience, there is no cart management functionality, etc.).
 * A production app would need to handle this very differently.
 */

class Store {

  constructor() {
    this.lineItems = [];
    this.products = {};
    this.displayOrderSummary();
  }

  getOrderTotal() {
    return 100;
  }

  // Expose the line items for the order (in a way that is friendly to the Orders API).
  getOrderItems() {
    let items = [];
    this.lineItems.forEach(item =>
      items.push({
        type: 'sku',
        parent: item.sku,
        quantity: item.quantity,
      })
    );
    return items;
  }

  // Retrieve the configuration from the API.
  async getConfig() {
    try {
      const response = await fetch('https://crypdeep.herokuapp.com/config');
      const config = await response.json();
      if (config.stripePublishableKey.includes('live')) {
        // Hide the demo notice if the publishable key is in live mode.
        document.querySelector('#order-total .demo').style.display = 'none';
      }
      return config;
    } catch (err) {
      return {error: err.message};
    }
  }


  // Load the product details.
  async loadProducts() {
    const productsResponse = await fetch('https://crypdeep.herokuapp.com/products');
    const products = (await productsResponse.json()).data;
    products.forEach(product => (this.products[product.id] = product));
  }


  // Create an order object to represent the line items.
  async createOrder(currency, items, email, shipping, metadata) {
    try {
      const response = await fetch('https://crypdeep.herokuapp.com/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          currency,
          items,
          email,
          shipping,
          metadata,
        }),
      });
      const data = await response.json();
      if (data.error) {
        return {error: data.error};
      } else {
        // Save the current order locally to lookup its status later.
        this.setActiveOrderId(data.order.id);
        return data.order;
      }
    } catch (err) {
      return {error: err.message};
    }
    return order;
  }
  // Pay the specified order by sending a payment source alongside it.
  async payOrder(order, source) {
    try {
      const response = await fetch(`https://crypdeep.herokuapp.com/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({source}),
      });
      const data = await response.json();
      if (data.error) {
        return {error: data.error};
      } else {
        return data;
      }
    } catch (err) {
      return {error: err.message};
    }
  }

  // Fetch an order status from the API.
  async getOrderStatus(orderId) {
    try {
      const response = await fetch(`/orders/${orderId}`);
      return await response.json();
    } catch (err) {
      return {error: err};
    }
  }

  // Format a price (assuming a two-decimal currency like EUR or USD for simplicity).
  formatPrice(amount, currency) {
    let price = (amount / 100).toFixed(2);
    let numberFormat = new Intl.NumberFormat(['en-US'], {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    });
    return numberFormat.format(price);
  }

  // Set the active order ID in the local storage.
  setActiveOrderId(orderId) {
    localStorage.setItem('orderId', orderId);
  }

  // Get the active order ID from the local storage.
  getActiveOrderId() {
    return localStorage.getItem('orderId');
  }

  // Manipulate the DOM to display the order summary on the right panel.
  async displayOrderSummary() {}
}

window.store = new Store();
