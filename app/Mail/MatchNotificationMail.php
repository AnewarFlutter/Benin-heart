<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MatchNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $matchedUser;
    public $recipientName;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($matchedUser, $recipientName)
    {
        $this->matchedUser = $matchedUser;
        $this->recipientName = $recipientName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Vous avez un nouveau match ! 💕')
                    ->view('emails.match-notification');
    }
}
