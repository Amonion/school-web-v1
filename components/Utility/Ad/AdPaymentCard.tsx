'use client'
import { formatDate, formatMoney } from '@/lib/helpers'
import AdStore from '@/src/zustand/finance/Ad'
import TransactionStore from '@/src/zustand/finance/Transaction'

const AdPaymentCard: React.FC = () => {
  const { itemFormData } = AdStore()
  const { walletForm } = TransactionStore()

  //   const getQuantity = (name: string): number => {
  //     if (name === 'Week') {
  //       return 7
  //     } else if (name === 'Month') {
  //       return 30
  //     } else {
  //       return 365
  //     }
  //   }

  return (
    <div className="flex card_body w-full sm:w-auto flex-col">
      <div className="paymentTableRow">
        <div className="min-w-[120px] paymentTableRowLeft">Balance</div>
        <div className="flex-1 p-2">
          {itemFormData.currencySymbol}
          {formatMoney(walletForm.balance)}
        </div>
      </div>
      {itemFormData.durationName && (
        <div className="paymentTableRow">
          <div className="min-w-[120px] paymentTableRowLeft">Ad Rate</div>
          <div className="flex-1 p-2">
            <div
              dangerouslySetInnerHTML={{
                __html: itemFormData.description,
              }}
            />
          </div>
        </div>
      )}
      <div className="paymentTableRow">
        <div className="min-w-[120px] paymentTableRowLeft">Min Deposit</div>
        <div className="flex-1 p-2">
          {itemFormData.currencySymbol}
          {formatMoney(itemFormData.amount)}
        </div>
      </div>

      <div className="paymentTableRow">
        <div className="min-w-[120px] paymentTableRowLeft">Duration </div>
        <div className="flex-1 p-2">
          {/* {itemFormData.duration} Days{' '}
          {getQuantity(itemFormData.durationName) > 0
            ? `* ${getQuantity(itemFormData.durationName)} = ${
                getQuantity(itemFormData.durationName) * itemFormData.duration
              } Days`
            : ''} */}
          {itemFormData.duration} Days{' '}
          {`* ${itemFormData.quantity} = ${
            itemFormData.quantity * itemFormData.duration
          } Days`}
        </div>
      </div>

      <div className="paymentTableRow">
        <div className="min-w-[120px] paymentTableRowLeft">Total </div>
        <div className="flex-1 p-2">
          {itemFormData.currencySymbol}
          {formatMoney(itemFormData.amount)}
        </div>
      </div>
      <div className="paymentTableRow">
        <div className="min-w-[120px] paymentTableRowLeft">Publishing on </div>
        <div className="flex-1 p-2">
          {itemFormData.publishedAt === new Date()
            ? 'Today'
            : itemFormData.publishedAt < new Date()
            ? 'Immediately'
            : formatDate(itemFormData.publishedAt)}
        </div>
      </div>
    </div>
  )
}

export default AdPaymentCard
