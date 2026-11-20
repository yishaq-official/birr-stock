type props = {
    params: Promise<{ productID: string, reviewID: string }>;
}

export default async function SingleReview({ params }: props) {
    const { productID, reviewID } = await params;

    return (
        <div>
            <h1>Review {reviewID} for Product {productID}</h1>
        </div>
    );
}
