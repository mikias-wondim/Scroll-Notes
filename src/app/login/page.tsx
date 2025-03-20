import AuthForm from "@/components/forms/AuthForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function LoginPage() {
  return (
    <div className="mt-10 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Welcome back! Enter your credentials to login.
          </CardDescription>
        </CardHeader>

        <AuthForm type="login" />
      </Card>
    </div>
  );
}

export default LoginPage;
