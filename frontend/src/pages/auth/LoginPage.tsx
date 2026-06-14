import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loginStart, loginSuccess, loginFailure } from '../../features/auth/authSlice';
import { loginUser, LoginRequest } from '../../features/auth/authThunks';

const loginSchema = z.object({
  email: z.string().email('נא להזין אימייל תקף'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(loginStart());

    try {
      const response = await loginUser(values as LoginRequest);
      dispatch(loginSuccess(response));
      try {
        localStorage.setItem('auth', JSON.stringify(response));
      } catch (e) {
        // ignore localStorage errors
      }
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאת התחברות';
      dispatch(loginFailure(message));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
