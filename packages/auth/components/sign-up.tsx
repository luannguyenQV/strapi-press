import { signIn } from '../';

export const SignUp = (): React.JSX.Element => (
  <form
    action={async () => {
      "use server";
      await signIn();
    }}
  >
    <button type="submit">Sign up</button>
  </form>
);
