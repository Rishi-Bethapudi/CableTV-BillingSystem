
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  connection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table (TV packages/plans)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  installation_fee DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15) NOT NULL,
  address TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table (links customers to products)
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  monthly_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number VARCHAR(30) UNIQUE NOT NULL,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'cheque', 'online', 'card', 'upi')),
  transaction_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_number VARCHAR(30) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'cheque', 'online', 'card')),
  vendor_name VARCHAR(100),
  receipt_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_customer_code ON public.customers(customer_code);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_products_product_code ON public.products(product_code);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_agents_agent_code ON public.agents(agent_code);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_bills_customer_id ON public.bills(customer_id);
CREATE INDEX idx_bills_bill_number ON public.bills(bill_number);
CREATE INDEX idx_bills_status ON public.bills(status);
CREATE INDEX idx_bills_due_date ON public.bills(due_date);
CREATE INDEX idx_payments_bill_id ON public.payments(bill_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_complaints_customer_id ON public.complaints(customer_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on agents" ON public.agents FOR ALL USING (true);
CREATE POLICY "Allow all operations on subscriptions" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all operations on bills" ON public.bills FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on complaints" ON public.complaints FOR ALL USING (true);
CREATE POLICY "Allow all operations on expenses" ON public.expenses FOR ALL USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for products (TV packages)
INSERT INTO public.products (product_code, name, description, monthly_price, installation_fee, category) VALUES
('PKG-BASIC', 'Basic Cable Package', 'Essential channels package with 50+ channels', 299.00, 500.00, 'Basic'),
('PKG-STANDARD', 'Standard Cable Package', 'Popular channels package with 100+ channels', 599.00, 500.00, 'Standard'),
('PKG-PREMIUM', 'Premium Cable Package', 'Premium channels package with 200+ channels including HD', 999.00, 1000.00, 'Premium'),
('PKG-SPORTS', 'Sports Add-on Package', 'All sports channels add-on', 199.00, 0.00, 'Add-on'),
('PKG-MOVIES', 'Movies Add-on Package', 'Premium movie channels add-on', 299.00, 0.00, 'Add-on');

-- Insert sample agents
INSERT INTO public.agents (agent_code, first_name, last_name, email, phone, commission_rate) VALUES
('AGT-001', 'Rajesh', 'Kumar', 'rajesh.kumar@example.com', '9876543210', 5.00),
('AGT-002', 'Priya', 'Sharma', 'priya.sharma@example.com', '9876543211', 4.50),
('AGT-003', 'Amit', 'Singh', 'amit.singh@example.com', '9876543212', 5.50);

-- Insert sample customers
INSERT INTO public.customers (customer_code, first_name, last_name, email, phone, address, city, state, pincode) VALUES
('CUST-001', 'Suresh', 'Gupta', 'suresh.gupta@example.com', '9123456789', '123 MG Road', 'Mumbai', 'Maharashtra', '400001'),
('CUST-002', 'Meera', 'Patel', 'meera.patel@example.com', '9123456790', '456 Park Street', 'Delhi', 'Delhi', '110001'),
('CUST-003', 'Vikram', 'Reddy', 'vikram.reddy@example.com', '9123456791', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001');
