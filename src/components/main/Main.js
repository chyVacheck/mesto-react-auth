
import React from "react";
import { api } from './../../utils/Api.js';
import Card from './../card/Card.js';

function Main(props) {

  const [userName, setUserName] = React.useState();
  const [userDescription, setUserDescription] = React.useState();
  const [userAvatar, setUserAvatar] = React.useState('../../images/avatar.png');

  const [cards, setCards] = React.useState([]);

  const handleEditAvatarClick = props.onEditAvatar;

  const handleEditProfileClick = props.onEditProfile;

  const handleAddPlaceClick = props.onAddPlace;

  React.useEffect(() => {
    //? запрос на данные о пользователе
    api.getUserInfo()
      .then((res) => {
        // console.log(res);
        setUserName(res.name);
        setUserDescription(res.about);
        setUserAvatar(res.avatar);
      })
      .catch((error) => {
        console.log(error);
      })
    //? запрос на карточки
    let array = [];
    api.getCardArray()
      .then((res) => {
        res.map((item) => {
          array = [...array, item];
        })
        return array;
      })
      .then((res) => {
        setCards(res);
      })
      .catch((error) => {
        console.log(error);
      })
  },
    [] //для только 1 запуска
  );

  return (
    <main className="content">
      {/* <!-- ? секция profile --> */}
      <section className="profile">
        <div onClick={handleEditAvatarClick} style={{ backgroundImage: `url(${userAvatar})` }} className="profile__avatar">
        </div>
        <div className="profile__info">
          <div className="profile__nick-and-button">
            <h1 className="profile__nickname">{userName}</h1>
            <button
              onClick={handleEditProfileClick}
              aria-label="открытие редактирования профиля"
              type="button"
              className="profile__edit-button button"
            ></button>
          </div>
          <p className="profile__description">{userDescription}</p>
        </div>
        <button
          onClick={handleAddPlaceClick}
          aria-label="открытие добавление новой карточки"
          type="button"
          className="profile__add-button button"
        ></button>
        {/* <!--? пока что нет скрипта для этого --> */}
      </section>
      {/* <!-- ? секция elements--> */}
      <section className="elements">
        <ul className="elements__list-cards">
          {cards.map((item) => {
            return (<Card
              name={item.name}
              link={item.link}
              card={item}
              length={item.likes.length}
              onCardClick={props.onCardClick}
            />);
          })}
        </ul>
      </section>
    </main>
  )
}

export default Main;
