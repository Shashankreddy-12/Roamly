const checkIn=document.querySelector("#checkIn");
const checkOut=document.querySelector("#checkOut");

const bookingSummary=document.querySelector("#bookingSummary");

const totalNights=document.querySelector("#totalNights");

const totalPrice=document.querySelector("#totalPrice");

if(checkIn && checkOut){

    function updateBookingSummary(){

        if(!checkIn.value || !checkOut.value){

            bookingSummary.classList.add("d-none");

            return;
        }

        const start=new Date(checkIn.value);

        const end=new Date(checkOut.value);

        const milliseconds=end-start;

        const nights = Math.round(milliseconds / (1000 * 60 * 60 * 24));

        if(nights<=0){

            bookingSummary.classList.add("d-none");

            return;
        }

        const total=nights*pricePerNight;

        const nightText = nights === 1 ? "Night" : "Nights";
        totalNights.textContent = `${nights} ${nightText}`;

        totalPrice.textContent=
            total.toLocaleString("en-IN");

        bookingSummary.classList.remove("d-none");

    }

    checkIn.addEventListener(
        "change",
        updateBookingSummary
    );

    checkOut.addEventListener(
        "change",
        updateBookingSummary
    );

}