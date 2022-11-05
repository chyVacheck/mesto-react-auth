
import SingForm from '../signForm/SignForm.js';

function Login() {
  return (
    <section className="sign">
      <article className="sign__container">
        <SingForm
          formTitle={'Вход'}
          submitTitle={'Войти'}
        />
      </article>
    </section>
  )
}

export default Login;