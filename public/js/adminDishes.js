let dishes = document.getElementById("dishList").children;
let dishLength = document.getElementById("dishList").children.length;

console.log(dishLength);

for (let i = 0; i < dishLength; i++) {
    document.getElementById(dishes[i].id).addEventListener("click", async function (event) {
        if (event.target.id === "del") {
            try {
                const response = await fetch(`/dishes/${dishes[i].id}`, { "method": "DELETE" });
                if (response.status === 200)
                    window.location.reload(); // <--- Cause the browser to reload the EJS
            } catch (err) {
                console.error(err);
            }
        }
        else if (event.target.id === "edit") {



            event.preventDefault();
            toggleModal();

            const overlay = document.querySelector('.modal-overlay')
            overlay.addEventListener('click', toggleModal)

            let closemodal = document.getElementById('modal-close')

            closemodal.addEventListener('click', toggleModal)


            document.onkeydown = function (evt) {
                evt = evt || window.event
                let isEscape = false
                if ("key" in evt) {
                    isEscape = (evt.key === "Escape" || evt.key === "Esc")
                } else {
                    isEscape = (evt.keyCode === 27)
                }
                if (isEscape && document.body.classList.contains('modal-active')) {
                    toggleModal()
                }
            };


            try {
                const response = await fetch(`/dishes/${dishes[i].id}`, { "method": "GET" });
                if (response.status === 200) {
                    let object = await response.json();

                    document.getElementById("name").value = object.name;
                    document.getElementById("description").value = object.description;
                    document.getElementById("dishType").value = object.dishType;
                    document.getElementById("price").value = object.price;
                    document.getElementById("photoUrl").value = object.photoUrl;

                    document.getElementById('editform').action = `/dishes/${dishes[i].id}`; 

                }
            } catch (err) {
                console.error(err);
            }


        }
    

    });
}

function toggleModal() {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
}




