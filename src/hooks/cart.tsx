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

const keyAsyncStorage = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storaged = await AsyncStorage.getItem(keyAsyncStorage);
      if (storaged) {
        setProducts([...JSON.parse(storaged)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(item => item.id === product.id);

      const insertProduct: Product = {
        ...product,
        quantity: findProduct?.quantity ? findProduct.quantity + 1 : 1,
      };

      setProducts([
        ...products.filter(item => item !== product.id),
        insertProduct,
      ]);

      await AsyncStorage.setItem(keyAsyncStorage, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(state => {
        return state.map(product => {
          if (product.id === id) {
            return {
              ...product,
              quantity: product.quantity + 1,
            };
          }
          return { ...product };
        });
      });

      await AsyncStorage.setItem(keyAsyncStorage, JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      setProducts(state => {
        return state.map(product => {
          if (product.id === id) {
            return {
              ...product,
              quantity: product.quantity > 1 ? product.quantity - 1 : 1,
            };
          }
          return { ...product };
        });
      });

      await AsyncStorage.setItem(keyAsyncStorage, JSON.stringify(products));
    },
    [products],
  );

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
