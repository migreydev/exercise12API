// Función para obtener los parámetros de la URL
function getParams() {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  let params = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}

// Evento para configurar la API y obtener todos los productos
document
  .querySelector("#api-config-form")
  .addEventListener("click", (event) => {
    event.preventDefault();

    // Obtener todos los productos
    fetch("http://localhost:8080/api/v1/product")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        return response.json();
      })
      .then((products) => {
        showProducts(products); // Mostrar los productos
      })
      .catch((error) => {
        console.error("Error", error);
      });
  });

// Función para agregar un producto
function addProduct() {
  document
    .querySelector("#insertElementForm")
    .addEventListener("submit", (event) => {
      event.preventDefault(); // Evitar que el formulario se envíe

      const productName = document.querySelector("#productName").value;
      const productPrice = document.querySelector("#productPrice").value;
      console.log("Producto a insertar:", productName, productPrice);

      if (!productName || !productPrice) {
        console.log("Campos vacíos");
      }

      if (isNaN(productPrice) || productPrice <= 0) {
        console.log("Valor no válido para el precio");
      }

      const productData = {
        name: productName,
        price: parseFloat(productPrice),
      };

      console.log("Datos a enviar:", productData);

      // Realizar la solicitud POST para insertar el producto
      fetch("http://localhost:8080/api/v1/product/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error al insertar producto: ${response.statusText}`
            );
          }

          console.log("Producto insertado con éxito.");

          // Actualizar la lista de productos
          return fetch("http://localhost:8080/api/v1/product");
        })
        .then((response) => response.json())
        .then((products) => {
          showProducts(products); // Mostrar los productos actualizados
        })
        .catch((error) => {
          console.error("Error al insertar producto:", error);
        });
    });
}

// Función para mostrar los productos en la tabla
function showProducts(products) {
  const productList = document.querySelector("#product-list");
  productList.innerHTML = "<h3>Lista de Productos</h3>";

  const table = document.createElement("table");

  const headerRow = document.createElement("tr");
  const headers = ["ID", "Nombre", "Precio", "Acciones"];
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  products.forEach((product) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = product.productId;
    row.appendChild(idCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = product.productName;
    row.appendChild(nameCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = product.productPrice;
    row.appendChild(priceCell);

    const actionsCell = document.createElement("td");

    // Botón de editar
    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.onclick = () => editProduct(product.productId); // Asociar la acción de editar al producto
    actionsCell.appendChild(editButton);

    // Botón de eliminar
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.onclick = () => deleteProduct(product.productId); // Asociar la acción de eliminar al producto
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);
    table.appendChild(row);
  });

  productList.appendChild(table);
}

addProduct();

// Función para editar un producto
function editProduct(productId) {
  // Obtener el producto a editar
  fetch(`http://localhost:8080/api/v1/product/${productId}`)
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Producto con ID ${productId} no encontrado.`);
        }
        throw new Error("Error al obtener el producto");
      }
      return response.json();
    })
    .then((product) => {
      // Mostrar los valores en el formulario
      document.querySelector("#productName").value = product.productName;
      document.querySelector("#productPrice").value = product.productPrice;

      // Cambiar el evento del formulario para actualizar el producto
      document
        .querySelector("#insertElementForm")
        .addEventListener("submit", (event) => {
          event.preventDefault();

          const updatedProduct = {
            name: document.querySelector("#productName").value,
            price: parseFloat(document.querySelector("#productPrice").value),
          };

          // Realizar la solicitud PUT para actualizar el producto
          fetch(`http://localhost:8080/api/v1/product/update/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Error al actualizar el producto");
              }
              return response.json();
            })
            .then(() => {
              fetch("http://localhost:8080/api/v1/product")
                .then((response) => response.json())
                .then((products) => {
                  showProducts(products);
                });
            })
            .catch((error) => {
              console.error("Error al actualizar el producto:", error);
            });
        });
    })
    .catch((error) => {
      console.error("Error al obtener el producto:", error);
    });
}

// Función para eliminar un producto
function deleteProduct(productId) {
  fetch(`http://localhost:8080/api/v1/product/delete/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }
      console.log(`Producto con ID ${productId} eliminado correctamente.`);
      return response.json();
    })
    .then(() => {
      // Actualizar la lista de productos después de eliminar
      return fetch("http://localhost:8080/api/v1/product");
    })
    .then((response) => response.json())
    .then((products) => {
      showProducts(products); // Mostrar la lista actualizada
    })
    .catch((error) => {
      console.error("Error al eliminar el producto:", error);
    });
}
