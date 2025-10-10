import { usePathname } from 'next/navigation'
import HeaderWrapper from './HeaderWrapper'

export default function MainHeader() {
  const pathname = usePathname()

  return (
    <>
      {!pathname.includes('/home/friends') && (
        <>
          <HeaderWrapper />
        </>
      )}
    </>
  )
}
