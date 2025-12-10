'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WantToKnowMoreProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonUrl?: string;
  avatars?: Array<{
    src?: string;
    fallback: string;
    name: string;
  }>;
}

const defaultAvatars = [
  {
    src: '/image_avatar/_1.png',
    fallback: 'JD',
    name: 'avatar'
  },
  {
    src: '/image_avatar/_2.png',
    fallback: 'MS',
    name: 'avatar'
  },
  {
    src: '/image_avatar/_3.png',
    fallback: 'PL',
    name: 'avatar'
  },
   {
    src: '/image_avatar/_4.png',
    fallback: 'PL',
    name: 'avatar'
  },
  
];

export default function WantToKnowMore({
  title = "Want to know more?",
  description = "Our team is here to help you get the answers you need.",
  buttonText = "Get in touch",
  onButtonClick,
  buttonUrl = "/contact",
  avatars = defaultAvatars
}: WantToKnowMoreProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonUrl) {
      window.location.href = buttonUrl;
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {/* Avatar Group */}
        <div className="flex -space-x-4 mb-8">
          {avatars.map((avatar, index) => (
            <Avatar 
              key={index} 
              className="size-14 ring-4 ring-background border-2 border-white dark:border-gray-800"
            >
              <AvatarImage src={avatar.src} alt={avatar.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                {avatar.fallback}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          {title}
        </h3>

        {/* Description */}
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
          {description}
        </p>

        {/* Button */}
        <Button 
          size="lg"
          onClick={handleClick}
          className="px-8 py-6 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}