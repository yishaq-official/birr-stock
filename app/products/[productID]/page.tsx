type Props = {
  params: Promise<{ productID: string }>;
};

export default async function Product({ params }: Props) {
  const { productID } = await params;

  return (
    <div>
      <h1>Product {productID} Page</h1>
    </div>
  );
}
