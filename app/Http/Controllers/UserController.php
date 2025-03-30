<?php

namespace App\Http\Controllers;

use App\ArgState;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function panelIndex()
    {
        $items = User::query()
            ->get();

        return Inertia::render('Panel/PanelUsers', [
            'pageData' => [
                'users' => $items
            ],
        ]);
    }

    public function panelIndexProfile()
    {
        return Inertia::render('Panel/PanelProfile', [
            'pageData' => [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'role' => ['required', Rule::in(UserRole::getValues())],
            'password' => ['required', 'string', 'confirmed'],
            'active' => ['nullable', 'boolean'],
        ]);

        $data['password'] = bcrypt($data['password']);

        return User::create($data);
    }

    public function update(Request $request, int $id)
    {
        $item = User::findOrFail($id);
        $rules = [
            'name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'role' => ['required', Rule::in(UserRole::getValues())],
            'active' => ['nullable', 'boolean'],
        ];
        if (ArgState::isAdmin()) {
            $rules['password'] = ['nullable', 'string', 'confirmed'];
        }
        $data = $request->validate($rules);

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = bcrypt($data['password']);
                if ($item->id == auth()->id()) {
                    auth()->logout();
                }
            } else {
                unset($data['password']);
            }
        }

        $item->update($data);

        return $item;
    }

    public function changePassword(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'old_password' => ['required', 'string', 'current_password:web'],
            'password' => ['required', 'string', 'confirmed'],
        ]);

        $user->password = bcrypt($data['password']);
        $user->save();

        auth()->login($user);

        $user->makeHidden('password');
        return $user;
    }
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $userClass = 'App\Models\User';
        $user = $userClass::where('email', $data['email'])->first();
        if (! $user) {
            abort(404);
        }

        if (Hash::check($data['password'], $user->password)) {
            auth()->login($user);
            $request->session()->regenerate();

            return $user;
        }

        abort(404);
    }

    public function logout(Request $request): Response|Application|Redirector|RedirectResponse
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
