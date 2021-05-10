     
          let dishes = document.getElementById("dishList").children;
          let dishesLength = document.getElementById("dishList").children.length;
            
          for (let i = 0; i < dishesLength; i++) {
          
          document.getElementById(dishes[i].id).addEventListener("click",  async function (event) {
                    if (event.target.id === "removeDishBtn")
                    {
                    
                        const response = await fetch(`/user`, { "method": "GET" });
                        if (response.status === 200)
                        {
                     
                            response.text().then( async function (text) {
                                const response = await fetch(`/add-dishtocart/${text}?dishID=${dishes[i].id}&dishIndex=${i}`, { "method": "DELETE" });
                                    if (response.status === 200)
                                    {
                                      window.location.reload();
                                       alert(`Deleted ${dishes[i].name}  From Shopping Cart`);
                                    }
                                  else{
                                    alert("Cannot delete");
                                  }
                            });
                        }
                        else{
                         alert(response.status);
                        }
                    }
                });
   
        }
        

        let menus = document.getElementById("menuList").children;
          let menusLength = document.getElementById("menuList").children.length;
            
          for (let i = 0; i < menusLength; i++) {
          
          document.getElementById(menus[i].id).addEventListener("click",  async function (event) {
                    if (event.target.id === "removeMenuBtn")
                    {
                    
                        const response = await fetch(`/user`, { "method": "GET" });
                        if (response.status === 200)
                        {
                     
                            response.text().then( async function (text) {
                                const response = await fetch(`/add-menutocart/${text}`, { "method": "DELETE" });
                                    if (response.status === 200)
                                    {
                                      window.location.reload();
                                       alert(`Deleted ${menusLength[i].name}  From Shopping Cart`);
                                    }
                                  else{
                                    alert("Cannot delete");
                                  }
                            });
                        }
                        else{
                         alert(response.status);
                        }
                    }
                });
        }
 
       document.getElementById("createorder").addEventListener("click",  async function (event) {
            
                   const response = await fetch(`/user`, { "method": "GET" });
                   if (response.status === 200)
                   {
               
                       response.text().then( async function (text) {
                           const response = await fetch(`/order/${text}`, { "method": "POST" });
                               if (response.status === 200)
                               {
                                 alert("Order created. Please check your email.");
                                 window.location.href="/";

                               } 
                               else
                               {
                                alert("Order failed. Please check again!");
                               }
                       });
                   }
                   else{
                      alert(response.status);
                   }
               
           });