import Image from 'next/image';

const Brand = ({ ...props }) => (
  <Image
    src="/images/roommitra-logo.svg"
    alt="Room Mitra logo"
    {...props}
    width={110}
    height={50}
    priority
  />
);
export default Brand;
