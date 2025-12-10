<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public $senderName;
    public $messagePreview;
    public $recipientName;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($senderName, $messagePreview, $recipientName)
    {
        $this->senderName = $senderName;
        $this->messagePreview = $messagePreview;
        $this->recipientName = $recipientName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Nouveau message de ' . $this->senderName)
                    ->view('emails.new-message');
    }
}
