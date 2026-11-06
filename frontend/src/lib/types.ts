export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type Paginated<T> = ApiSuccess<T[]> & { meta: PaginationMeta };

/** Errores de validación de Laravel: { campo: ["mensaje", ...] } */
export type FieldErrors = Record<string, string[]>;

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AuthData = {
  token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type Payment = {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string;
  status: string;
  amount_minor: number;
  currency: string;
  failure_code: string | null;
  failure_message: string | null;
  client_secret?: string;
  paid_at: string | null;
  created_at: string;
};

export type Order = {
  id: number;
  status: string;
  currency: string;
  subtotal: string;
  total: string;
  items?: OrderItem[];
  payments?: Payment[];
  created_at: string;
};

/** Estado que devuelven los Server Actions usados con useActionState. */
export type FormState = {
  message?: string;
  fieldErrors?: FieldErrors;
  /** Valores no sensibles para repoblar el formulario (React lo reinicia tras cada acción). */
  values?: Record<string, string>;
};
