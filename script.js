document.addEventListener('DOMContentLoaded', () => {
    // STATE
    let cart = [];
    const FORMSPREE_URL = 'https://formspree.io/f/xyzrdnyj'; // Your Formspree Endpoint

    // DOM Elements - Navigation & Cart
    const openCartBtn = document.getElementById('openCartBtn');
    const cartCountBadge = document.getElementById('cart-count');
    
    // DOM Elements - Product Modal
    const productModal = document.getElementById('productModal');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const addToCartBtns = document.querySelectorAll('.btn-select');
    const customiseBtns = document.querySelectorAll('.btn-customise');
    const addToCartForm = document.getElementById('addToCartForm');
    
    // Modal Inputs
    const sizeContainer = document.getElementById('size-container');
    const sizeSelect = document.getElementById('size-select');
    const customNameField = document.getElementById('custom-name-field');
    const customNameInput = document.getElementById('custom-name-input');
    const isCustomInput = document.getElementById('is-custom');
    
    // DOM Elements - Cart/Invoice Modal
    const cartModal = document.getElementById('cartModal');
    const closeCartModalBtn = document.getElementById('closeCartModal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const invoiceSection = document.getElementById('invoice-section');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // DOM Elements - Bank Details Modal
    const bankDetailsModal = document.getElementById('bankDetailsModal');
    const closeBankDetailsModalBtn = document.getElementById('closeBankDetailsModal');
    const closeBankDetailsAndFinishBtn = document.getElementById('closeBankDetailsAndFinish');
    const finalOrderSummary = document.getElementById('final-order-summary');


    // === FUNCTION TO PREPARE AND OPEN MODAL ===
    const openProductModal = (btn, custom = false) => {
        const name = btn.getAttribute('data-product');
        const color = btn.getAttribute('data-color');
        const price = btn.getAttribute('data-price');
        const type = btn.getAttribute('data-type');

        // Set hidden fields
        document.getElementById('modal-product-name').value = name;
        document.getElementById('modal-product-color').value = color;
        document.getElementById('modal-product-price').value = price;
        document.getElementById('modal-product-type').value = type;
        isCustomInput.value = custom;

        // Update UI
        document.getElementById('modal-product-title').innerText = `${name} (${color})`;

        // Customisation Field Logic
        if (custom) {
            customNameField.classList.remove('hidden');
            customNameInput.setAttribute('required', 'true');
            document.getElementById('modal-submit-btn').innerText = "ADD CUSTOM ORDER";
        } else {
            customNameField.classList.add('hidden');
            customNameInput.removeAttribute('required');
            customNameInput.value = ""; // Clear custom name if not custom
            document.getElementById('modal-submit-btn').innerText = "ADD TO ORDER";
        }

        // Size & Accessory Logic
        if (type === 'accessory') {
            sizeContainer.style.display = 'none';
            sizeSelect.removeAttribute('required');
            sizeSelect.value = "N/A"; 
        } else {
            sizeContainer.style.display = 'block';
            sizeSelect.setAttribute('required', 'true');
            sizeSelect.value = ""; // Reset selection
        }

        productModal.style.display = 'block';
    };

    // === 1. PRODUCT INTERACTION LISTENERS ===
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => openProductModal(btn, false));
    });

    customiseBtns.forEach(btn => {
        btn.addEventListener('click', () => openProductModal(btn, true));
    });

    closeProductModalBtn.onclick = () => productModal.style.display = 'none';

    // === 2. ADD TO CART LOGIC ===

    addToCartForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isCustom = isCustomInput.value === 'true';

        // Check if custom name is required but empty
        if (isCustom && !customNameInput.value.trim()) {
            alert("Please enter a custom name for this order.");
            return;
        }

        const customName = isCustom ? customNameInput.value.trim().toUpperCase() : null;

        const item = {
            id: Date.now(),
            name: document.getElementById('modal-product-name').value,
            color: document.getElementById('modal-product-color').value,
            price: parseFloat(document.getElementById('modal-product-price').value),
            size: document.getElementById('size-select').value || 'One Size',
            qty: parseInt(document.getElementById('quantity-input').value),
            custom: customName 
        };

        cart.push(item);
        updateCartUI();
        productModal.style.display = 'none';
        
        // Reset form inputs used
        addToCartForm.reset();
        customNameInput.value = "";
        
        // Notification
        const notification = document.createElement('div');
        notification.textContent = `${item.name} added to order!`;
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    });

    // === 3. CART MANAGEMENT ===

    function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        cartCountBadge.innerText = totalItems;
    }

    function renderCartContents() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            invoiceSection.classList.add('hidden');
            cartTotalPrice.innerText = 'R0';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            const customText = item.custom ? `(CUSTOM: ${item.custom})` : '';

            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name} (${item.color}) ${customText}</h4>
                    <p>Size: ${item.size} | Qty: ${item.qty}</p>
                    <p>R${itemTotal}</p>
                </div>
                <div class="cart-item-remove" data-id="${item.id}">&times;</div>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalPrice.innerText = 'R' + total;
        invoiceSection.classList.remove('hidden');

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeItem(parseInt(e.target.getAttribute('data-id')));
            });
        });
    }

    window.removeItem = (id) => {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
        renderCartContents();
    };

    // === 4. MODAL OPEN/CLOSE ===
    
    openCartBtn.onclick = () => {
        renderCartContents();
        cartModal.style.display = 'block';
    };

    closeCartModalBtn.onclick = () => cartModal.style.display = 'none';
    closeBankDetailsModalBtn.onclick = () => bankDetailsModal.style.display = 'none';
    closeBankDetailsAndFinishBtn.onclick = () => bankDetailsModal.style.display = 'none'; // Closes on button click

    window.onclick = (e) => {
        if (e.target === productModal) productModal.style.display = 'none';
        if (e.target === cartModal) cartModal.style.display = 'none';
        if (e.target === bankDetailsModal) bankDetailsModal.style.display = 'none';
    };

    // === 5. CHECKOUT / ORDER SUBMISSION (SUBMIT TO FORMSPREE & DISPLAY BANK DETAILS) ===
    
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Collect User Data
        const formData = new FormData(checkoutForm);
        const userDetails = Object.fromEntries(formData);
        
        // 2. Prepare Order Summary for console logging, Formspree (plain text), and modal display (HTML)
        const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        
        const cartSummaryList = cart.map(item => {
            const customNote = item.custom ? ` [CUSTOM: ${item.custom}]` : '';
            return {
                text: `- ${item.qty}x ${item.name} (${item.color}, ${item.size})${customNote} @ R${item.price} each = R${item.price * item.qty}`,
                html: `${item.qty}x ${item.name} (${item.color}, ${item.size})${customNote} (<strong>R${item.price * item.qty}</strong>)`
            };
        });
        
        const cartSummaryText = cartSummaryList.map(item => item.text).join('\n');
        const cartSummaryHTML = cartSummaryList.map(item => item.html).join('<br>');


        // 3. SEND DATA TO FORMSPREE
        const dataToSend = {
            'Name': `${userDetails.firstName} ${userDetails.surname}`,
            'Email': userDetails.email,
            'Phone Number (WhatsApp)': userDetails.phone,
            'Order Details': cartSummaryText, // Full, itemized list
            'Total Amount Due': 'R' + totalAmount,
            '_replyto': userDetails.email, // Allows you to hit reply in your email client
        };

        fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (response.ok) {
                console.log('Formspree submission successful! Email triggered.');
            } else {
                console.error('Formspree submission failed. Check your Formspree dashboard or network tab.');
            }
        })
        .catch(error => {
            console.error('Error during Formspree fetch submission:', error);
        });


        // 4. Console Log (Your Manual Backup)
        console.log('--- NEW SAYEYO ORDER LOG (Formspree Sent) ---');
        console.log('Time:', new Date().toLocaleString());
        console.log('Customer Details:', userDetails);
        console.log('Order Items:', cart.map(item => ({
            product: item.name,
            color: item.color,
            size: item.size,
            qty: item.qty,
            custom_name: item.custom || 'N/A',
            price: item.price
        })));
        console.log('TOTAL:', 'R' + totalAmount);
        console.log('----------------------------');


        // 5. Display Bank Details Modal
        const summaryHTML = `
            <strong>Name:</strong> ${userDetails.firstName} ${userDetails.surname}<br>
            <strong>Contact:</strong> ${userDetails.phone} | ${userDetails.email}<br>
            <hr class="divider" style="margin: 10px 0; border-top: 1px solid #ddd;">
            <strong>Order Items:</strong><br>
            ${cartSummaryHTML}<br>
            <hr class="divider" style="margin: 10px 0; border-top: 1px solid #ddd;">
            <strong>TOTAL DUE:</strong> <span style="color: var(--gold);">R${totalAmount}</span>
        `;
        
        finalOrderSummary.innerHTML = summaryHTML;
        cartModal.style.display = 'none'; // Close the cart modal
        bankDetailsModal.style.display = 'block'; // Open the bank details modal

        // 6. Clear the cart state and UI for the next customer
        cart = [];
        updateCartUI();
        checkoutForm.reset();
    });
});