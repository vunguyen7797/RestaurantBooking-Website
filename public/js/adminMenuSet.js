

//document.getElementById('optionform').action = `/admin-menuset/cat`; 



let menuSets = document.getElementById("menuSetList").children;
let menuSetsLength = document.getElementById("menuSetList").children.length;


for (let i = 0; i < menuSetsLength; i++) {
    document.getElementById(menuSets[i].id).addEventListener("click", async function (event) {
        if (event.target.id === "del") {
        
            try {
                const response = await fetch(`/menuset/${menuSets[i].id}`, { "method": "DELETE" });
                if (response.status === 200)
                    window.location.reload(); // <--- Cause the browser to reload the EJS
            } catch (err) {
                console.error(err);
            }
        }
        else if (event.target.id === "edit") {

            event.preventDefault();
            toggleEditModal();

            const overlay = document.querySelector('.modal-overlay')
            overlay.addEventListener('click', toggleEditModal)

            document.onkeydown = function (e) {
                e = e || window.event
                let isEscapePressed = false
                if ("key" in e) {
                    isEscapePressed = (e.key === "Escape" || e.key === "Esc")
                } else {
                    isEscapePressed = (e.keyCode === 27)
                }
                if (isEscapePressed && document.body.classList.contains('modal-active')) {
                    toggleEditModal()
                }
            };

            try {
                const response = await fetch(`/menuset/${menuSets[i].id}`, { "method": "GET" });
                const menuContent = await fetch(`/menuset/content/${menuSets[i].id}`, { "method": "GET" });
                if (response.status === 200 && menuContent.status === 200) {
              
                    let menuSetJson = await response.json();
                    let menuContentJson = await menuContent.json();
                    document.getElementById("name").value = menuSetJson.name;
                    document.getElementById("categories").value = menuSetJson.category;
                    document.getElementById("price").value = menuSetJson.price;

                        document.getElementById("dish1").value = menuContentJson[0].dishID;
                        document.getElementById("dish2").value = menuContentJson[1].dishID;
                        document.getElementById("dish3").value = menuContentJson[2].dishID;
                        document.getElementById("dish4").value = menuContentJson[3].dishID;
                        document.getElementById("dish5").value = menuContentJson[4].dishID;
                   

                    document.getElementById('editform').action = `/menuset/${menuSets[i].id}`; 

                }
            } catch (err) {
                console.error(err);
            }

        }
    

    });
}

function toggleEditModal() {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
}

