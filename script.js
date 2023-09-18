"use strict";

class FavoritePlace {
  constructor(name, date, description, coords) {
    this.name = name;
    this.date = date;
    this.description = description;
    this.coords = coords;
    this.id = (Date.now() + "").slice(-10);
  }
}

class FavoritePlacesApp {
  #map;
  #mapZoomLevel = 13;
  #favoritePlaces = [];

  constructor() {
    this._getPosition();
    this._getLocalStorage();
    this._setupForm();
    this._setupResetButton();
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const coords = [latitude, longitude];
        this._loadMap(coords);
      },
      () => {
        alert("Could not get your position");
      }
    );
  }

  _loadMap(coords) {
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#favoritePlaces.forEach((place) => {
      this._renderFavoritePlaceMarker(place);
      this._renderPlace(place); // Add place to the list
    });

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    const coords = mapE.latlng;
    const { lat, lng } = coords;
    const nameInput = document.querySelector(".form__input--name");
    const dateInput = document.querySelector(".form__input--date");
    const descriptionInput = document.querySelector(
      ".form__input--description"
    );
    const form = document.querySelector("form");

    nameInput.value = "";
    dateInput.value = "";
    descriptionInput.value = "";

    form.classList.remove("hidden");

    document.querySelector(".btn-form").addEventListener("click", () => {
      const name = nameInput.value;
      const date = dateInput.value;
      const description = descriptionInput.value;

      if (name && date && description) {
        const newPlace = new FavoritePlace(name, date, description, [lat, lng]);
        this.#favoritePlaces.push(newPlace);
        this._renderFavoritePlaceMarker(newPlace);
        this._setLocalStorage();
        $(".form").modal("hide");
        this._renderPlace(newPlace);
      }
    });
  }

  _setupForm() {
    const form1 = `
      <div class="modal fade form" tabindex="-1" role="dialog">
        <!-- Modal content here -->
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", form1);
  }

  _renderPlace(place) {
    const placeDate = new Date(place.date);
    const placeMonth = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(placeDate);
    const placeDay = placeDate.getDate();
    const placeYear = placeDate.getFullYear();
    let html = `
      <li class="place" data-id=${place.id}>
        <h2 class="place__title">${place.name}</h2>
        <p class="place__description">${place.description}</p>
        <div class="place__date">
          <span class="place__icon">⏰</span>
          <span class="place__value">${placeMonth} ${placeDay}, ${placeYear}</span>
        </div>
        
      </li>`;

    const list = document.querySelector(".places");
    list.insertAdjacentHTML("beforeend", html);
  }

  _setupResetButton() {
    const resetButton = document.querySelector(".reset");
    resetButton.addEventListener("click", () => {
      localStorage.removeItem("favoritePlaces");
      location.reload();
    });
  }

  _renderFavoritePlaceMarker(place) {
    const placeDate = new Date(place.date);
    const placeMonth = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(placeDate);
    const placeDay = placeDate.getDate();
    const placeYear = placeDate.getFullYear();
    L.marker(place.coords)
      .addTo(this.#map)
      .bindPopup(
        `<b>${place.name}</b><br>${placeMonth} ${placeDay}, ${placeYear}<br>${place.description}`,
        {
          autoClose: false,
        }
      )
      .openPopup();
  }

  _setLocalStorage() {
    localStorage.setItem(
      "favoritePlaces",
      JSON.stringify(this.#favoritePlaces)
    );
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("favoritePlaces"));
    if (data) {
      this.#favoritePlaces = data;
    }
  }
}

const app = new FavoritePlacesApp();
