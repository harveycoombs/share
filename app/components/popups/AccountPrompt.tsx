import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import Popup from "@/app/components/common/Popup";
import Button from "@/app/components/common/Button";

interface Properties {
    onClose: () => void;
}

export default function AccountPrompt({ onClose }: Properties) {
     return (
          <Popup title="Share Account" onClose={onClose}>
               <div className="w-80 mt-3">
                    <div className="w-12 h-12 text-2xl mx-auto grid place-items-center rounded-md border bg-green-400/15 text-green-200/75 border-green-200/75">
                         <FontAwesomeIcon icon={faUser} />
                    </div>
                    
                    <strong className="block text-center text-lg text-white font-semibold mt-3.5">Get More out of Share</strong>
                    
                    <div className="font-medium text-sm text-center mt-1 mb-4.25">Log in or create an account to access<br/>more features</div>
     
                    <div className="flex gap-3.5 items-center">
                         <Button url="/signin" classes="w-1/2">Sign In</Button>
                         <Button url="/signup" classes="w-1/2" type="secondary">Sign Up</Button>
                    </div>
               </div>
          </Popup>
     );
}