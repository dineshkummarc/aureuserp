<?php

namespace Webkul\Security\Filament\Resources\RoleResource\Pages;

use BezhanSalleh\FilamentShield\Support\Utils;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Collection;
use Webkul\Security\Filament\Resources\RoleResource;

class CreateRole extends CreateRecord
{
    protected static string $resource = RoleResource::class;

    public Collection $permissions;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if ($data['select_all'] ?? false) {
            $this->permissions = RoleResource::getAllFormPermissions();
        } else {
            $this->permissions = collect($data)
                ->filter(fn ($permission, $key) => ! in_array($key, ['name', 'guard_name', 'select_all']))
                ->values()
                ->flatten()
                ->unique();
        }

        return [
            'name'       => $data['name'],
            'guard_name' => $data['guard_name'] ?? Utils::getFilamentAuthGuard(),
        ];
    }

    protected function afterCreate(): void
    {
        $this->record->syncPermissionsByNames($this->permissions);
    }
}
