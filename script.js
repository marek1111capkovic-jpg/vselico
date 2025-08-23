//https://docs.google.com/spreadsheets/d/e/2PACX-1vQufNgszhNnNMG6lZ6Gs0NX_yRdrb32qsu5KIFw5eg0wEceZxxgbKSWoTpH8FrXhBc5UE_LTn2tVhs0/pub?output=csv
// Produkty - v reálnom projekte by ste načítavali z databázy alebo API
// Košík
let cart = [];
let products = []; // Prázdne pole, ktoré naplníme z API

// DOM elementy
const productContainer = document.getElementById('product-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');

// Načítanie produktov z Google Sheets
async function loadProducts(category = 'all') {
    try {
        // Zobrazenie načítavania
        document.getElementById('loading').style.display = 'block';
        productContainer.innerHTML = '';
        
        // URL vášho Google Sheets zverejneného ako CSV
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQufNgszhNnNMG6lZ6Gs0NX_yRdrb32qsu5KIFw5eg0wEceZxxgbKSWoTpH8FrXhBc5UE_LTn2tVhs0/pub?output=csv');
        const csvData = await response.text();
        
        // Konverzia CSV na JSON
        products = csvToJson(csvData);
        
        // Konverzia dátových typov
        products = products.map(product => ({
            id: parseInt(product.id),
            title: product.nazov,
            price: parseFloat(product.cena),
            image: product.obrazok,
            description: product.popisok,
            stock: parseInt(product.pocet)
        }));
        
        // Filtrovanie produktov
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
        
        // Skrytie načítavania
        document.getElementById('loading').style.display = 'none';
        
        // Zobrazenie produktov
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
                    <p class="product-stock">Na sklade: ${product.stock} ks</p>
                    <button class="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Nie je na sklade' : 'Pridať do košíka'}
                    </button>
                </div>
            `;
            productContainer.appendChild(productElement);
        });
        
        // Pridanie event listenerov pre tlačidlá "Pridať do košíka"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
        
    } catch (error) {
        console.error('Chyba pri načítavaní produktov:', error);
        document.getElementById('loading').style.display = 'none';
        productContainer.innerHTML = '<p>Produkty sa nepodarilo načítať. Skúste to prosím neskôr.</p>';
    }
}

// Pomocná funkcia na konverziu CSV na JSON
function csvToJson(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const result = [];
    const headers = lines[0].split(',').map(header => header.trim());
    
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',').map(item => item.trim());
        
        for (let j = 0; j < headers.length; j++) {
            if (j < currentline.length) {
                obj[headers[j]] = currentline[j] || '';
            } else {
                obj[headers[j]] = '';
            }
        }
        
        // Pridáme iba neprázdne riadky
        if (Object.values(obj).some(value => value !== '')) {
            result.push(obj);
        }
    }
    
    return result;
}

// Pridanie do košíka s kontrolou dostupného množstva
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (product.stock === 0) {
        alert('Tento produkt nie je na sklade.');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('Nie je dostatok tovaru na sklade.');
            return;
        }
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

// Zväčšenie množstva s kontrolou dostupného množstva
function increaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item.quantity >= product.stock) {
        alert('Nie je dostatok tovaru na sklade.');
        return;
    }
    
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

// Pridanie funkcionality pre leták (voliteľné)
document.addEventListener('DOMContentLoaded', function() {
    const flyerLink = document.querySelector('.btn-flyer');
    
    if (flyerLink) {
        // Sledovanie kliknutí na leták (pre analytické účely)
        flyerLink.addEventListener('click', function() {
            console.log('Používateľ si otvoril leták');
            // Sem by ste mohli pridať kód pre analytics (Google Analytics, Facebook Pixel, atď.)
            // napr.: gtag('event', 'letak_klik');
        });
        
        // Kontrola existencie súboru letáku (voliteľné)
        checkFlyerExists('letak.pdf');
    }
});

// Funkcia na kontrolu existencie súboru letáku (voliteľné)
function checkFlyerExists(url) {
    fetch(url, { method: 'HEAD' })
    .then(response => {
        if (!response.ok) {
            console.warn('Leták nebol nájdený na zadanom mieste: ' + url);
        }
    })
    .catch(error => {
        console.error('Chyba pri kontrole letáku: ', error);
    });
}
// Funkcionalita pre preklik na rezerváciu
document.addEventListener('DOMContentLoaded', function() {
    const reserveBtn = document.getElementById('reserve-in-store-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (reserveBtn) {
        reserveBtn.addEventListener('click', function() {
            // Ulož obsah košíka do localStorage alebo sessionStorage
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Ulož produkty do sessionStorage pre rezervačnú stránku
            sessionStorage.setItem('reservationProducts', JSON.stringify(cartItems));
            
            // Zavri modálne okno
            cartModal.style.display = 'none';
            
            // Presmeruj na rezervačnú stránku
            window.location.href = 'rezervacia.html';
        });
    }
    
    // Zatvorenie modálneho okna
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Zatvorenie modálneho okna pri kliknutí mimo neho
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
});