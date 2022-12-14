
import { useState, useEffect } from 'react';
import ProtectedRoute from './protectedRouter/ProtectedRouter.js';

//? компоненты 
import Header from './header/Header.js';
import Login from './login/Login.js';
import Register from './register/Register.js';
import Main from './main/Main.js';
import Footer from './footer/Footer.js';
import PopupWithForm from './popupWithForm/PopupWithForm.js';
import ImagePopup from './imagePopup/ImagePopup.js';
import InfoTooltip from './infoTooltip/InfoTooltip.js';
import BurgerMenu from './burgerMenu/burgerMenu.js';

import { api } from '../utils/Api.js';
import { auth } from '../utils/Auth.js';

import successfulIcon from '../images/InfoTooltip/successful-icon.svg';
import unsuccessfulIcon from '../images/InfoTooltip/unsuccessful-icon.svg';

import { Routes, useNavigate, Navigate, Route, NavLink } from 'react-router-dom';
import { CurrentUserContext } from './../contexts/CurrentUserContext.js';

//? импорт всех поп-ап`ов
import EditProfilePopup from './editProfilePopup/EditProfilePopup.js';
import EditAvatarPopup from './editAvatarPopup/EditAvatarPopup.js';
import AddPlacePopup from './addPlacePopup/AddPlacePopup.js';

function App() {

  const navigate = useNavigate();

  //? хуки открытия поп-апов
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isCardPopupOpen, setIsCardPopupOpen] = useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  //? хук модификатора фона в бургерном меню
  const [isIconCloseBurgerMenu, setIsIconCloseBurgerMenu] = useState(false);

  //? авторизованость
  const [loggedIn, setLoggedIn] = useState(false);

  //? infoTooltip, сообщение и иконка
  const [infoTooltipMessage, setInfoTooltipMessage] = useState('');
  const [infoTooltipImage, setInfoTooltipImage] = useState(unsuccessfulIcon);

  //? пользователь данные и аватар
  const [currentUser, setCurrentUser] = useState({});
  const [currentEmail, setCurrentEmail] = useState('');

  //? выбранная карточка
  const [selectedCard, setSelectedCard] = useState(null);

  //? массив всех карточек
  const [cards, setCards] = useState([]);

  //? Открыт хоть один поп-ап
  const isOpen = (isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard);

  //? Ожидание ответа с сервера 
  const [isLoading, setIsLoading] = useState(false);

  //? запрос token
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      handleToken(token);
    }
  }, [loggedIn])

  //? проверяем авторизацию и делаем запрос на сервер
  useEffect(() => {
    if (loggedIn) {
      //? запрос данных о пользователе
      api.getUserInfo()
        .then((data) => {
          setCurrentUser(data); //* устанавливаем данные пользователя получаенные с сервера
        })
        .catch((error) => {
          //* Выводим сообщение для быстрого понимания, где конкретно была ошибка
          console.log('Ошибка во время запроса данных о пользователе');
          console.log(error);
        })

      //? запрос на карточки
      api.getCardArray()
        .then((res) => {
          setCards(res); //* устанавливаем карточки получаенные с сервера
        })
        .catch((error) => {
          //* Выводим сообщение для быстрого понимания, где конкретно была ошибка
          console.log('Ошибка во время запроса карточек');
          console.log(error);
        })
    }
  }, [loggedIn])

  //? вешаем слушатель нажатия кнопки Escape
  useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === 'Escape') {
        closeAllPopups();
      }
    }

    if (isOpen) { //? навешиваем только при открытии
      document.addEventListener('keydown', closeByEscape);
      return () => {
        document.removeEventListener('keydown', closeByEscape);
      }
    }
  }, [isOpen])

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsCardPopupOpen(false);
    setIsInfoTooltipPopupOpen(false);
    setSelectedCard(null);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsCardPopupOpen(true);
  }

  function handleUpdateUser(newUserInfo) {
    setIsLoading(true);
    api.setUserInfo(newUserInfo)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch(err => console.log(`Ошибка: ${err}`))
      .finally(() => {
        setIsLoading(false);
      })
  }

  function handleUpdateAvatar(newAvatar) {
    setIsLoading(true);
    api.setUserAvatar(newAvatar)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch(err => console.log(`Ошибка: ${err}`))
      .finally(() => {
        setIsLoading(false);
      })
  }

  function handleAddPlaceSubmit(card) {
    setIsLoading(true);
    api.addNewCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(err => console.log(`Ошибка: ${err}`))
      .finally(() => {
        setIsLoading(false);
      })
  }

  function handleCardLike(card) {
    //? Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLike(card, currentUser._id)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((error) => {
        //? Выводим сообщение для быстрого понимания, где конкретно была ошибка
        console.log('Ошибка во время запроса лайка карточки');
        console.log('Id: ', card._id);
        console.log(error);
      })
  }

  function handleCardDelete(card) {
    //? Отправляем запрос в API на удаление карточки
    api.deleteCard(card)
      .then(() => {
        setCards((state) =>
          state.filter((c) => (c._id === card._id ? false : true))
        )
      })
      .catch((error) => {
        //? Выводим сообщение для быстрого понимания, где конкретно была ошибка
        console.log('Ошибка во время запроса на удаление карточки');
        console.log('Id: ', card._id);
        console.log(error);
      })
  }

  function setInfoTooltip(error = false, message) {
    if (error) {
      setInfoTooltipMessage(message ? message : 'Что-то пошло не так! Попробуйте ещё раз.');
      setInfoTooltipImage(unsuccessfulIcon);
    } else {
      setInfoTooltipMessage(message ? message : 'Вы успешно зарегистрировались!');
      setInfoTooltipImage(successfulIcon);
    }
    setIsInfoTooltipPopupOpen(true);
  }

  function handleRegistration(email, password) {
    auth
      .registration(email, password)
      .then((res) => {
        if (res.status !== 400) {
          setInfoTooltip();
          navigate('/');
        }
      })
      .catch((err) => {
        setInfoTooltip(true); //todo передавать разные значения ответов
        return console.log(err);
      })
  }

  function handleAuthorization(email, password) {
    auth
      .authorization(email, password)
      .then((res) => {
        localStorage.setItem('jwt', res.token);
        if (localStorage.getItem('jwt')) {
          setLoggedIn(true);
          setCurrentEmail(email);
          navigate('/');
        }
      })
      .catch((err) => {
        setInfoTooltip(true); //todo передавать разные значения ответов
        return console.log(err);
      })
  }

  function handleToken(token) {
    auth
      .validationJWT(token, "проверки токена")
      .then((res) => {
        if (res) {
          setLoggedIn(true);
          setCurrentEmail(res.data.email);
          navigate('/');
        }
      })
      .catch((err) => {
        console.log(`Запрос на сервер (auth.nomoreparties.co) с целью проверки токена выдал: ${err}`);
      })
  }

  function handleSignOut() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    setCurrentEmail('');
  }

  function openCloseBugrer() {
    setIsInfoOpen(!isInfoOpen);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      {/* контент сайта, блок content */}
      <Routes>
        {/* основной контент */}
        <Route
          exact
          path="/"
          element={
            <ProtectedRoute
              loggedIn={loggedIn}
            >
              {/* шапка сайта, блок header */}
              <article id='info' className={isInfoOpen ? 'info info_active' : 'info'}>
                <p className='info__email'>{currentEmail}</p>
                <button className='info__button button' onClick={handleSignOut}>Выйти</button>
              </article>

              <Header>
                <BurgerMenu
                  close={isIconCloseBurgerMenu}
                  setClose={setIsIconCloseBurgerMenu}
                  onClick={openCloseBugrer}
                  currentEmail={currentEmail}
                  handleSignOut={handleSignOut} />
              </Header>
              {/* основная часть сайта, блок main */}
              <Main
                cards={cards}
                handleCardLike={handleCardLike}
                handleCardDelete={handleCardDelete}
                onEditAvatar={handleEditAvatarClick}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onCardClick={handleCardClick}
              />
              {/*//? подвал сайта, блок footer */}
              <Footer />

              {/*//* pop-up`ы сайта */}
              {/*//* avatar pop-up */}
              <EditAvatarPopup
                isLoading={isLoading}
                onUpdateAvatar={handleUpdateAvatar}
                isOpen={isEditAvatarPopupOpen}
                onClose={closeAllPopups}
              />

              {/*//* edit pop-up */}
              <EditProfilePopup
                isLoading={isLoading}
                onUpdateUser={handleUpdateUser}
                isOpen={isEditProfilePopupOpen}
                onClose={closeAllPopups}
              />

              {/*//* add pop-up */}
              <AddPlacePopup
                isLoading={isLoading}
                onAddPlace={handleAddPlaceSubmit}
                isOpen={isAddPlacePopupOpen}
                onClose={closeAllPopups}
              />

              {/*//* Card pop-up */}
              <ImagePopup
                isOpen={isCardPopupOpen}
                card={selectedCard}
                onClose={closeAllPopups}
              />

              {/*//* delete pop-up */}
              <PopupWithForm
                name='delete'
                popupTitle='Вы уверены?'
                buttonTitle='Да'
                isOpen={false}
                onClose={closeAllPopups}
              />
            </ProtectedRoute>
          }>
        </Route>

        {/* регистрация */}
        <Route
          path='/signup'
          element={
            <>
              <Header>
                <NavLink className='header__link link' to='/signin'>Войти</NavLink>
              </Header>
              <Register handleRegistration={handleRegistration} />
            </>
          }>
        </Route>

        {/* авторизация */}
        <Route
          path='/signin'
          element={
            <>
              <Header>
                <NavLink className='header__link link' to='/signup'>Регистрация</NavLink>
              </Header>
              <Login handleAuthorization={handleAuthorization} />
            </>
          }>
        </Route>

        {/* все остальное */}
        <Route
          path="*"
          element={
            <Navigate to="/" />
          }>
        </Route>

      </Routes>

      <InfoTooltip
        isOpen={isInfoTooltipPopupOpen}
        img={infoTooltipImage}
        message={infoTooltipMessage}
        onClose={closeAllPopups}
      />

    </CurrentUserContext.Provider >
  );
}

export default App;
