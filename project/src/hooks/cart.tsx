/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
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
  clear(): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsList = await AsyncStorage.getItem('@MARKETPLACES:PRODUCTS');
      if (productsList) {
        setProducts(JSON.parse(productsList));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const { id } = product;

      const existProduct = products.find(item => item.id === id);

      if (existProduct) {
        const ProductsUpdated = products.map(elem =>
          elem.id === id ? { ...elem, quantity: elem.quantity + 1 } : elem,
        );
        setProducts(ProductsUpdated);
        await AsyncStorage.setItem(
          '@MARKETPLACES:PRODUCTS',
          JSON.stringify(ProductsUpdated),
        );
      } else {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);
        await AsyncStorage.setItem(
          '@MARKETPLACES:PRODUCTS',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const ProductsUpdated = products.map(elem =>
        elem.id === id ? { ...elem, quantity: elem.quantity + 1 } : elem,
      );
      setProducts(ProductsUpdated);
      await AsyncStorage.setItem(
        '@MARKETPLACES:PRODUCTS',
        JSON.stringify(ProductsUpdated),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const ProductsUpdated = products.map(elem =>
        elem.id === id ? { ...elem, quantity: elem.quantity - 1 } : elem,
      );
      setProducts(ProductsUpdated);
      await AsyncStorage.setItem(
        '@MARKETPLACES:PRODUCTS',
        JSON.stringify(ProductsUpdated),
      );
    },
    [products],
  );

  const clear = useCallback(async () => {
    setProducts([]);
    await AsyncStorage.removeItem('@MARKETPLACES:PRODUCTS');
  }, []);

  const value = React.useMemo(
    () => ({ clear, addToCart, increment, decrement, products }),
    [clear, products, addToCart, increment, decrement],
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
