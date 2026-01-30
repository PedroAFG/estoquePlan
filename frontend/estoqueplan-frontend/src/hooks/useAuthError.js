import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export const useAuthError = () => {
  const navigate = useNavigate();
  const { clearUser } = useUser();

  const handleAuthError = (error) => {
    if (error.message === 'Token expirado ou inválido' || error.message.includes('401')) {
      // Limpar estado do usuário
      clearUser();
      // Redirecionar para login
      navigate('/', { replace: true });
      return true; // Indica que foi um erro de autenticação
    }
    return false; // Não foi um erro de autenticação
  };

  return { handleAuthError };
}; 