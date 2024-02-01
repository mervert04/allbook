$('.owl-carousel').owlCarousel({
  stagePadding: 50,/*the little visible images at the end of the carousel*/
  loop:true,
  rtl: false,
  lazyLoad:true,
  margin:0,
  nav:true,
  responsive:{
      0:{
          items:2
      },
      600:{
          items:2
      },
      800:{
          items: 3
      },
      1000:{
          items:2
      },
    1200:{
        items: 5
    }
  }
})


const stripe = Stripe('{{ pk_test_51L5PGEAnRZ2oaZEjWNWt7yXWKY3VNfZcMOOOy5ZYa4mxtuRDowexGOdhb8ZKRvNHit3YxEWp46VEbfutwvxDpNjN00Y96iOB4p }}');
const elements = stripe.elements();

const cardElement = elements.create('card');
cardElement.mount('#card-element');

function initializePayment() {
  return fetch('/payments', { method: 'POST' })
    .then(res => res.text())
    .then(JSON.parse);
}

async function confirmPayment(clientSecret) {
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
    },
  });
  if (result.error) {
    console.error(result.error);
  } else {
    alert('Thank you for your business!');
  }
}

document.getElementById('pay-button')
  .addEventListener('click', async () => {
    const { clientSecret } = await initializePayment();
    confirmPayment(clientSecret);
  });