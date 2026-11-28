import { useQuery } from '@tanstack/react-query'
import { listAccountsForCustomer } from '../api/accounts'
import { useSession } from '../auth/AuthContext'

/** The signed-in customer's accounts. Shares the cache key used by the Accounts page. */
export function useMyAccounts() {
  const { customerId } = useSession()
  return useQuery({ queryKey: ['accounts', customerId], queryFn: () => listAccountsForCustomer(customerId) })
}
