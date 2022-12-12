

// DELETE PRODUCT IMAGE
function deleteProductImage(imageId, productId) {
  $.ajax({
    url: '/admin/edit-product/image/' + productId + '/' + imageId,
    method: "GET",
    success: (response) => {
      if (response.status) {
        location.reload()
      }

    }
  })
}

function deleteProduct(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `delete-product/${id}`,
        method: "GET",
        success: () => {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        }
      })
      location.reload()
    }
  })
}

function incProductCount(productId, count, price, id, totalId) {



  let currentCount = document.getElementById(id).innerHTML

  currentCount = parseInt(currentCount)

  count = parseInt(count)
  price = parseInt(price)

  if (currentCount > 1 && count == -1 || currentCount >= 1 && count == 1) {

    $.ajax({

      url: '/change-product-count',
      data: {
        product: productId,
        count: count

      },
      method: 'post',
      success: (response) => {

        if (response.status) {
          count = parseInt(count)
          currentCount = parseInt(currentCount)
          let total = (currentCount + count)

          //take the price form bom and add and applay

          document.getElementById(id).innerHTML = total
          let priceTotal = total * price
          document.getElementById(totalId).innerHTML ="$"+priceTotal
          document.getElementById('subTotal').innerHTML = "$"+response.subTotal
          document.getElementById('tableTotal').innerHTML = "$"+response.subTotal        
        }
      }
    })
  }
}

function addToCart(productId) {
  $.ajax({
    url: '/add-to-cart/' + productId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item added to Cart',
          showConfirmButton: false,
          timer: 1000
        })
      }
    }
  })
}


function CancelOrder(productId, orderId) {
  $.ajax({
    url: '/change-order-status/' + productId + '/' + orderId,
    method: 'get',
    success: (response) => {

      if (response.status) {
        window.location.reload()
      }
    }
  })
}
function ReturnOrder(productId, orderId) {
  $.ajax({
    url: '/return-order-status/' + productId + '/' + orderId,
    method: 'get',
    success: (response) => {

      if (response.status) {
        window.location.reload()
      }
    }
  })
}

$('#order-checkout').submit((e) => {

  e.preventDefault()
  $.ajax({
    url: '/checkout',
    type: 'POST',
    data: $('#order-checkout').serialize(),
    success: async function (response) {

      if (response.COD) {
        await Swal.fire(
          'Order Placed!',
          'Check your Orders!',
          'success'
        )
        location.href = '/order-placed'
      }
    
       else if (response.razorPay) {
        razorPayPayment(response)
        
      }
      else if(response.Paypal){
      
        location.href = response.response
      }
      else if(response.wallet){
        await Swal.fire(
          'Order Placed!',
          'Check your Orders!',
          'success'
        )
        location.href = '/order-placed'
      }
    }
  })


function razorPayPayment(order) {
  
  const options = {
    "key": "rzp_test_NLQ1SXnLhVzOOE", // Enter the Key ID generated from the Dashboard
  "amount": order.response.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  "currency": "INR",
  "name": "DOTPC",
  "description": "Test Transaction",
  "image": "",
  "order_id": order.response.data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
  "handler": function (response){
    verifyPayment(response,order)
  },
  "prefill": {
    "name": "asd",
  "email": "as@gmail.com",
  "contact": "1234567890"
},
  "notes": {
    "address": "Razorpay Corporate Office"
},
  "theme": {
    "color": "#3399cc"
}
};
let rzp1 = new Razorpay(options);
rzp1.open();
}

function verifyPayment(payment,order){

  $.ajax({
    url:'/verify-payment',
    data:{
      payment,
      order
    },
    method:'POST',
    success:function(response){
      location.href = response.url
    }
  })
}
})


function addAddress() {
  $('#add-address').submit((e) => {
    e.preventDefault()
    $.ajax({
      url: "/add-address",
      type: "POST",
      data: $('#add-address').serialize(),
      success: async function (response) {
        if (response.status) {
          await Swal.fire(
            'Address Added!',
            '',
            'success'
          )
          location.href = '/my-profile/address'
        }
       
      }
    })
  })
  
}
function addAddressCheckout() {
  $('#add-address-checkout').submit((e) => {
    e.preventDefault()
    $.ajax({
      url: "/add-address",
      type: "POST",
      data: $('#add-address-checkout').serialize(),
      success: async function (response) {
        if (response.status) {
          await Swal.fire(
            'Address Added!',
            '',
            'success'
          )
          location.href = '/checkout'
        }
       
      }
    })
  })
  
}

function deleteAddress(userId, addressId) {
  Swal.fire({
    title: 'Remove Address',
    text: 'Are you sure you want to remove this address?',
    showCancelButton: true,
    confirmButtonText: 'Remove',
    iconHtml: null
  }).then((result) => {
    if (result.isConfirmed) {

      $.ajax({
        url: '/my-account/address/delete',
        data: {
          userId, addressId
        },
        method: 'delete',
        success: (response) => {


          if (response) {
            Swal.fire({
              title: 'Removed',
              text: 'Address removed from your account',
              timer: 1500
            })
            const addressRow = document.getElementById(addressId)
            $(addressRow).remove()
          } else {
            Swal.fire({
              title: 'Error',
              timer: 1500
            })
          }
        }
      })
    }
  })
}



function addToWishlist(productId) {
  $.ajax({
    url: '/add-to-wish/' + productId,
    method: 'get',
    success: (response) => {
      if (response.added) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item added to your Wish',
          showConfirmButton: false,
          timer: 1000
        })
      }
      if (response.removed) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item removed from your Wish',
          showConfirmButton: false,
          timer: 1000
        })
      }
    }
  })
}

function RemoveFormWishlist(productId) {

  $.ajax({
    url: '/remove-from-wishlist/' + productId,
    method: 'get',
    success: async (response) => {
      if (response.status) {
        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item removed form your Wish',
          showConfirmButton: false,
          timer: 1000
        })
      }

      $("#wishlist").load(window.location.href + " #wishlist");
    }
  })
}

function addToCartFromWishlist(productId) {


  $.ajax({
    url: '/addto-cart-from-wishlist/' + productId,
    method: 'get',
    success: async (response) => {
      if (response.status) {
        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item added to your cart',
          showConfirmButton: false,
          timer: 1000
        })
        $("#wishlist").load(window.location.href + " #wishlist");
      }

    }
  })

}


function RemoveFromCart(productId) {

  $.ajax({
    url: '/remove-from-cart/' + productId,
    method: 'get',
    success: async (response) => {
      if (response.status) {
        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item removed form your Wish',
          showConfirmButton: false,
          timer: 1000
        })
      }

      $("#cartTable").load(window.location.href + " #cartTable");
      $("#cartTotal").load(window.location.href + " #cartTotal");
    }
  })
}


function getReportByWeek() {
 

let from = document.getElementById("weekFrom").value
let to = document.getElementById("weekTo").value
let type='week'
$.ajax({
  url:'sales-report/'+type,
  method:"POST",
  data:{
    from,to
  },
  success:(response)=>{
    if (response.status) {
     
      
    }
  }


})


}

function deleteBanner(bannerId){
  Swal.fire({
    title: 'Remove Banner',
    text: 'Are you sure you want to remove this Banner?',
    showCancelButton: true,
    confirmButtonText: 'Remove',
    iconHtml: null
  }).then((result) => {
    if (result.isConfirmed) {

      $.ajax({
        url: '/admin/banner-delete/',
        data: {
         bannerId
        },
        method: 'delete',
        success: (response) => {
          if (response.status) {
            Swal.fire({
              title: 'Removed',
              text: 'Banner has been removed',
              timer: 1500
             
            })
           $("#banners").load(window.location.href + " #banners");
          } else {
            Swal.fire({
              title: 'Error',
              timer: 1500
            })
          }
        }
      })
    }
  })
}

$('#add-category').submit((e)=>{

  e.preventDefault()
  $.ajax({
    url:'/admin/add-categories',
     method:'POST',
     data:$('#add-category').serialize(),
     success: async function(response){
      if(response.addStatus){
        await Swal.fire(
         'Category has been Created'
        )    
        $("#category-table").load(window.location.href + " #category-table");
      }
    else {
     await Swal.fire(
        'This Category Alredy Exist'
 
      )
  
     }
    }
     
  })
})


  
// $("add-brand").on("submit", function (e) {
//   e.preventDefault();

//   $.ajax({
//     url:'/admin/brand-management',
//      method:'POST',
//      data:{
//       brandName:$("Bname").val(),
//       description:$("Bdis").val(),
//       images:$("file-input").val()
//      },

//      success: async function(response){
//       if(response){
//         await Swal.fire(
//          'brand has been Created'
//         )    
//         $("#brand-table").load(window.location.href + " #brand-table");
//         document.getElementById('Bname').value=''
//         document.getElementById('Bdis').value=''
//       }
//     else {
//      await Swal.fire(
//         'This Brand Alredy Exist'
 
//       )
  
//      }
//     }
     
//   })
// })




  $("#form-coupon").on("submit", function (e) {
   e.preventDefault();
 

  let code = document.getElementById('code').value
   $.ajax({
      url:"/verify-coupon",
      data:{code},
      method:'POST',
      success:(response)=>{
        if(response.noCoupon){
          Swal.fire({
          icon: 'error',
            title: 'Oops...',
            text: 'No coupon found!',
           
          })
        }
      else if(response.used){
        Swal.fire(
          'this coupon is alredy used',
          'Enter Coupon Code correctly!',
          'success'
        )
      }
      else if(response.dateExpired){
        Swal.fire(
          'This Coupon expired',
          'Enter new Coupon Code !',
          'success'
        )
      }
      else if(response.noMinPurchase){
        Swal.fire(
          'Buy more ',
          'The minimum limit is not reached!',
          'success'
        )
      }
      else {
        Swal.fire({
          title: 'Are you sure?',
          text: "once you applay coupon then it can't be reused!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, Apply Coupon!'
        }).then((result) => {
          if (result.isConfirmed) {
            let total = document.getElementById("checkout-total").value
            let data = response
            $.ajax({
              url: '/apply-coupon',
              method: "POST",
              data:data,
              success: (verifyResponse) => {
                if(verifyResponse.status){
                Swal.fire(
                  'Claimed!',
                  'Coupon Claimed Successfully.',
                  'success'
                )
                document.getElementById('checkoutTotal').innerHTML = response.payableAmount 
                document.getElementById('CheckoutTotal').innerHTML = response.payableAmount
                location.reload()

              }
              }
            })
           
          }
        })
      }
      }
    })
 })

   function deleteCoupon(code){
    Swal.fire({
      title: 'Remove Coupon',
      text: 'Are you sure you want to remove this Banner?',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      iconHtml: null
    }).then((result) => {
      if (result.isConfirmed) {
  
        $.ajax({
          url: '/admin/coupon-delete',
          data: {
           code
          },
          method: 'delete',
          success: (response) => {
            if (response) {
              Swal.fire({
                title: 'Removed',
                text: 'Banner has been removed',
                timer: 1500
               
              })
             $("#coupon-table").load(window.location.href + " #coupon-table ");
            } else {
              Swal.fire({
                title: 'Error',
                timer: 1500
              })
            }
          }
        })
      }
    })
   }

function search(){
  let text = document.getElementById('search-text').value
 document.getElementById("search-table1").style.display = "none";
 document.getElementById("search-table2").style.display = "none";


 
 
  $.ajax({
    url:'/shop-search',
    data:{text},
    method:'POST',
    success:(searchResponse)=>{
      if (searchResponse.length == 0) {
        document.getElementById("no-result").style.display = "block";
        document.getElementById("no-result").innerHTML = 'no result found'
        
       
      }else{
        document.getElementById("no-result").style.display = "none";
       document.getElementById("search-table1").style.display = "block";
       
      document.getElementById("search-data").innerHTML = searchResponse[0].name
      document.getElementById("search-data").href = 'product-details/'+searchResponse[0]._id
     
      
      if (searchResponse.length >1) {
        document.getElementById("no-result").style.display = "none";
      document.getElementById("search-data2").innerHTML = searchResponse[1].name
      document.getElementById("search-data2").href = 'product-details/'+searchResponse[1]._id
      document.getElementById("search-table2").style.display = "block";
      }

      
      }
      
    }
  })

}

