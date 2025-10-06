'use client'

import AdStore from '@/src/zustand/finance/Ad'

const AdTargetCard: React.FC = () => {
  const { itemFormData } = AdStore()

  return (
    <div className="flex card_body w-full sm:w-auto flex-col">
      <div className="paymentTableRow">
        <div className="min-w-[100px] paymentTableRowLeft">Category</div>
        <div className="flex-1 p-2">{itemFormData.category}</div>
      </div>
      <div className="paymentTableRow">
        <div className="min-w-[100px] paymentTableRowLeft">Ad Tags</div>
        <div className="flex-1 p-2 flex flex-wrap">
          {itemFormData.tags.map((item, index) => (
            <span
              key={index}
              className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="paymentTableRow">
        <div className="min-w-[100px] paymentTableRowLeft">Distribution</div>
        <div className="flex-1 p-2">{itemFormData.distribution}</div>
      </div>
      {itemFormData.distribution &&
        itemFormData.distribution !== 'International' && (
          <>
            {itemFormData.distribution !== 'National' ? (
              <>
                <div className="paymentTableRow">
                  <div className="min-w-[100px] paymentTableRowLeft">Areas</div>
                  <div className="flex-1 p-2 flex flex-wrap">
                    {itemFormData.areas.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="paymentTableRow">
                  <div className="min-w-[100px] paymentTableRowLeft">State</div>
                  <div className="flex-1 p-2 flex flex-wrap">
                    {itemFormData.distribution === 'Local' &&
                    !itemFormData.state ? (
                      <span className="text-sm text-[var(--custom)]">
                        Please click customize target area to select state
                      </span>
                    ) : (
                      <span>{itemFormData.state}</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="paymentTableRow">
                <div className="min-w-[100px] paymentTableRowLeft">States</div>
                <div className="flex-1 p-2 flex flex-wrap">
                  {itemFormData.states.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      <div className="paymentTableRow">
        <div className="min-w-[100px] paymentTableRowLeft">Country</div>
        <div className="flex-1 p-2 flex flex-wrap">{itemFormData.country}</div>
      </div>
      {itemFormData.countries.length > 0 && (
        <div className="flex justify-start border-b border-b-[var(--border)]">
          <div className="min-w-[100px] paymentTableRowLeft">Countries</div>
          <div className="flex-1 p-2 flex flex-wrap">
            {itemFormData.countries.map((item, index) => (
              <span
                key={index}
                className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdTargetCard
