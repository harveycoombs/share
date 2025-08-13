import Popup from "@/app/components/common/Popup";
import Button from "@/app/components/common/Button";

interface Properties {
    onClose: () => void;
}

export default function AccountPrompt({ onClose }: Properties) {
    return (
        <Popup title="Share Account" onClose={onClose}>
            <div className="w-80">
                <strong className="block text-center text-lg font-semibold mt-1">Get More out of Share</strong>

                <div className="font-medium text-sm text-center text-slate-400 mt-1 mb-5">Log in or create an account to access<br/>more features</div>

                <Button url="/login" classes="block w-full">Sign In</Button>
                <Button url="/register" classes="block w-full mt-2" color="gray">Sign Up</Button>
            </div>
        </Popup>
    );
}