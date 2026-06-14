import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginStart, loginSuccess, loginFailure } from '../../features/auth/authSlice';
import { loginUser, LoginRequest } from '../../features/auth/authThunks';
import './auth.css';

const loginSchema = z.object({
  email: z.string().email('נא להזין אימייל תקף'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authError = useAppSelector((state) => state.auth.error);
  const successMessage = (location.state as { message?: string } | null)?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(loginStart());
    try {
      const response = await loginUser(values as LoginRequest);
      dispatch(loginSuccess(response));
      try {
        localStorage.setItem('auth', JSON.stringify(response));
      } catch {
        // ignore
      }
      navigate('/');
    } catch (error: unknown) {
      let message = 'שגיאת התחברות';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      }
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <h2>ברוכים הבאים<br />לפורום שלנו</h2>
        <p>הצטרפו לדיונים, שתפו רעיונות והתחברו לקהילה. התחברו לחשבון שלכם כדי להמשיך.</p>
        <div className="auth-visual-dots">
          <span /><span /><span />
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>התחברות</h1>
          <p className="auth-card-subtitle">הזינו את פרטי החשבון שלכם</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-field">
              <label htmlFor="email">אימייל</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className={errors.email ? 'auth-input-error' : ''}
                {...register('email')}
              />
              {errors.email && <p className="auth-field-error">{errors.email.message}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="password">סיסמה</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={errors.password ? 'auth-input-error' : ''}
                {...register('password')}
              />
              {errors.password && <p className="auth-field-error">{errors.password.message}</p>}
            </div>

            {successMessage && <div className="auth-success-box">{successMessage}</div>}

            {authError && <div className="auth-error-box">{authError}</div>}

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>

          <div className="auth-footer">
            אין לך חשבון? <Link to="/register">צור חשבון חדש</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
