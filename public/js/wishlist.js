document.addEventListener("DOMContentLoaded", function () {
    // Attach click event listeners to each "Add to wishlist" button
    for (let i = 0; i < <%= bestseller.length %>; i++) {
        const wishlistButton = document.getElementById('wishlistButton' + i);
        wishlistButton.addEventListener("click", function () {
            addToWishlist('<%= bestseller[i]._id %>');
        });
    }
});

function addToWishlist(itemId) {
    // Perform the logic to add to the wishlist (could be an AJAX request, etc.)

    // Assuming you have a variable like isAddedToWishlist to track the status
    const isAddedToWishlist = true;

    const wishlistButton = document.getElementById('wishlistButton' + itemId);

    if (isAddedToWishlist) {
        // Add a class to change the button's style
        wishlistButton.classList.add('added');
        // You can also update the button text or perform other actions as needed
        wishlistButton.innerText = 'Added to Wishlist';
        // Optionally, you can disable the button to prevent further clicks
        wishlistButton.disabled = true;
    }
}
