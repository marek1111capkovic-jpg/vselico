// Produkty - v reálnom projekte by ste načítavali z databázy alebo API
const products = [
    {
        id: 1,
        title: "Vysávač",
        price: 129.99,
        category: "domacnost",
        image: "images/product1.jpg",
        description: "Výkonný vysávač pre vašu domácnosť."
    },
    {
        id: 2,
        title: "Kuchynský robot",
        price: 89.99,
        category: "domacnost",
        image: "images/product2.jpg",
        description: "Všestranný pomocník v kuchyni."
    },
    {
        id: 3,
        title: "Sada klúčov",
        price: 24.99,
        category: "naradie",
        image: "images/product3.jpg",
        description: "Kvalitná sada imbusových kľúčov."
    },
    {
        id: 4,
        title: "Vŕtačka",
        price: 59.99,
        category: "naradie",
        image: "images/product4.jpg",
        description: "Výkonná vŕtačka s akumulátorom."
    },
    {
        id: 5,
        title: "Model lietadla",
        price: 19.99,
        category: "hobby",
        image: "images/product5.jpg",
        description: "Stavebnica modelu lietadla."
    },
    {
        id: 6,
        title: "Farby na keramiku",
        price: 14.99,
        category: "hobby",
        image: "images/product6.jpg",
        description: "Sada farieb pre vaše umelecké projekty."
    }
];

// Košík
let cart = [];

// DOM elementy
const productContainer = document.getElementById('product-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');

// Načítanie produktov
function loadProducts(category = 'all') {
    productContainer.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toFixed(2)} €</p>
                <button class="add-to-cart" data-id="${product.id}">Pridať do košíka</button>
            </div>
        `;
        productContainer.appendChild(productElement);
    });
    
    // Pridanie event listenerov pre tlačidlá "Pridať do košíka"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Pridanie do košíka
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
}

// Aktualizácia košíka
function updateCart() {
    // Aktualizácia počtu položiek v ikone košíka
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Uloženie košíka do localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Zobrazenie košíka
function showCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Váš košík je prázdny.</p>';
        cartTotalPrice.textContent = '0.00';
    } else {
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <p class="cart-item-title">${item.title}</p>
                    <p class="cart-item-price">${item.price.toFixed(2)} €</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        cartTotalPrice.textContent = total.toFixed(2);
        
        // Pridanie event listenerov pre tlačidlá v košíku
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', decreaseQuantity);
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', increaseQuantity);
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', removeItem);
        });
    }
    
    cartModal.style.display = 'flex';
}

// Zmenšenie množstva
function decreaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCart();
    showCart();
}

// Zväčšenie množstva
function increaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    item.quantity += 1;
    
    updateCart();
    showCart();
}

// Odstránenie položky
function removeItem(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    
    updateCart();
    showCart();
}

// Filtrovanie produktov
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        loadProducts(button.getAttribute('data-category'));
    });
});

// Event listener pre ikonu košíka
cartIcon.addEventListener('click', showCart);

// Event listener pre zatvorenie modálneho okna
closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// Zatvorenie modálneho okna kliknutím mimo neho
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Načítanie košíka z localStorage pri načítaní stránky
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
    
    loadProducts();
});