let menus = document.getElementById("menuList").children;
let menuLength = document.getElementById("menuList").children.length;

for (let i = 0; i < menuLength; i++) {

document.getElementById(menus[i].id).addEventListener("click",  async function (event) {
        if (event.target.id === "orderbtn")
        {
          
            const response = await fetch(`/user`, { "method": "GET" });
            if (response.status === 200)
            {
         
                response.text().then( async function (text) {
                    const response = await fetch(`/add-menutocart/${text}?menuID=${menus[i].id}`, { "method": "POST" });
                        if (response.status === 200)
                        {
                         alert("Added To Shopping Cart");
                        }
                      
                });
            }
            else{
              window.location.href = '/login';
            }
        }
    });

}
