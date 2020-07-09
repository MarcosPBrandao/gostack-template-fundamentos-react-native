import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    //AsyncStorage.clear;
    //setProducts([]);
    // AsyncStorage.setItem(
    //   '@marketplace:products',
    //   JSON.stringify('')
    // );
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storedProducts = await AsyncStorage.getItem(
        '@marketplace:products'
      )
      if (storedProducts) {
        setProducts([...JSON.parse(storedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART
    const productExist = products.find(r => r.id === product.id);
    if (productExist) {
      setProducts(
        products.map(r =>
          r.id === product.id ? { ...product, quantity: r.quantity + 1 } : r,
          ),
      );
    } else {
      setProducts([...products, { ...product, quantity: 1 }]);
    }
    await AsyncStorage.setItem(
      '@marketplace:products',
      JSON.stringify(products)
    );

  }, [products]);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const productsNew = products.map(product =>
      product.id === id
      ? { ...product, quantity: product.quantity + 1}
      : product,
    );
    setProducts(productsNew);
    await AsyncStorage.setItem(
      '@marketplace:products',
      JSON.stringify(productsNew)
    );

  }, [products]);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const productsNew = products.map(product =>
      product.id === id && product.quantity > 1
      ? { ...product, quantity: product.quantity - 1}
      : product,
    );
    setProducts(productsNew);
    await AsyncStorage.setItem(
      '@marketplace:products',
      JSON.stringify(productsNew)
    );

  }, [products]);


  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
