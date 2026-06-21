import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Rola para o topo a cada mudança de rota (substitui o window.scrollTo do protótipo).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
