type Props ={
    params: Promise<{ productID: string }>;
}

export default async function Review({ params }: Props) {
    const { productID } = await params;

    return (
        <div>
            <h1>Review for Product {productID}</h1>
        </div>
    );
}