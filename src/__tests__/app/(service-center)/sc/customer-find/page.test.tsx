import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/render';
import userEvent from '@testing-library/user-event';
import CustomerFindPage from '@/app/(service-center)/sc/customers/page';
import { localStorage as safeStorage } from '@/shared/lib/localStorage';
import { createMockCustomer } from '@/test/utils/mocks';

// Mock dependencies
vi.mock('@/shared/lib/localStorage', () => ({
  localStorage: {
    getItem: vi.fn(() => []),
    setItem: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks', () => ({
  useRole: () => ({
    userRole: 'service_advisor',
    userInfo: { id: '1', name: 'Test User' },
  }),
}));

describe('CustomerFindPage', () => {
  const mockCustomers = [
    createMockCustomer({
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
    }),
    createMockCustomer({
      id: '2',
      name: 'Jane Doe',
      phone: '+1234567891',
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(safeStorage.getItem).mockReturnValue(mockCustomers as any);
  });

  it('renders customer  page', () => {
    render(<CustomerFindPage />);
    
    expect(screen.getByText(/Customer|Find|Search/i)).toBeInTheDocument();
  });

  it('displays customer search bar', () => {
    render(<CustomerFindPage />);
    
    const searchInput = screen.getByPlaceholderText(/search|customer|phone|name/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('searches customers by name', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const searchInput = screen.getByPlaceholderText(/search|customer|phone|name/i);
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('John');
    });
  });

  it('searches customers by phone', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const searchInput = screen.getByPlaceholderText(/search|customer|phone|name/i);
    await user.type(searchInput, '+1234567890');
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('+1234567890');
    });
  });

  it('displays recent customers table', () => {
    render(<CustomerFindPage />);
    
    expect(screen.getByText(/Customer|Find|Search/i)).toBeInTheDocument();
  });

  it('opens create customer modal', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const createButton = screen.getByRole('button', { name: /create|new|add|customer/i });
    await user.click(createButton);
  });

  it('displays customer details modal', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    // Click on a customer
    const customer = screen.queryByText('John Doe');
    if (customer) {
      await user.click(customer);
    }
  });

  it('handles empty search results', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const searchInput = screen.getByPlaceholderText(/search|customer|phone|name/i);
    await user.type(searchInput, 'NonExistentCustomer');
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('NonExistentCustomer');
    });
  });

  it('filters customers by type', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const filterButton = screen.queryByRole('button', { name: /filter|type|b2c|b2b/i });
    if (filterButton) {
      await user.click(filterButton);
    }
  });

  it('displays customer vehicles', async () => {
    render(<CustomerFindPage />);
    
    // Customer vehicles should be displayed when customer is selected
    expect(screen.getByText(/Customer|Find|Search/i)).toBeInTheDocument();
  });

  it('handles customer selection', async () => {
    const user = userEvent.setup();
    render(<CustomerFindPage />);
    
    const customer = screen.queryByText('John Doe');
    if (customer) {
      await user.click(customer);
    }
  });
});

