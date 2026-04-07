<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        return view('notifications.index');
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|min:3',
            'body' => 'required|min:10',
            'channel' => 'required|in:PUSH,EMAIL,WHATSAPP,IN_APP',
        ]);

        $this->api->sendNotification($data);
        return back()->with('success', 'Notificación enviada');
    }
}
