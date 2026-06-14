import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser, RegisterRequest } from '../../features/auth/authThunks';
import './auth.css';

const registerSchema = z.object({
  name: z.string().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('נא להזין אימייל תקף'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      await registerUser(values as RegisterRequest);
      navigate('/login', { state: { message: 'ההרשמה הושלמה בהצלחה. אנא היכנס.' } });
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message || 'שגיאת הרשמה כללית';
      setSubmitError(serverMessage);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <h2>הצטרפו<br />לקהילה שלנו</h2>
        <p>צרו חשבון חדש והתחילו לשתף, לשאול ולהשיב. הקהילה מחכה לכם.</p>
        <div className="auth-visual-dots">
          <span /><span /><span />
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>הרשמה</h1>
          <p className="auth-card-subtitle">צרו חשבון חדש בחינם</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-field">
              <label htmlFor="name">שם מלא</label>
              <input
                id="name"
                type="text"
                placeholder="השם שלך"
                className={errors.name ? 'auth-input-error' : ''}
                {...register('name')}
              />
              {errors.name && <p className="auth-field-error">{errors.name.message}</p>}
            </div>

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

            {submitError && <div className="auth-error-box">{submitError}</div>}

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'נרשם...' : 'צור חשבון'}
            </button>
          </form>

          <div className="auth-footer">
            יש לך כבר חשבון? <Link to="/login">התחבר כאן</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
