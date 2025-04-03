<?php

namespace Webkul\Purchase\Filament\Admin\Clusters\Configurations\Resources\VendorPriceResource\Pages;

use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Contracts\Support\Htmlable;
use Webkul\Purchase\Filament\Admin\Clusters\Configurations\Resources\VendorPriceResource;
use Webkul\Purchase\Models\ProductSupplier;
use Illuminate\Database\QueryException;

class EditVendorPrice extends EditRecord
{
    protected static string $resource = VendorPriceResource::class;

    public function getTitle(): string|Htmlable
    {
        return __('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.navigation.title');
    }

    protected function getSavedNotification(): Notification
    {
        return Notification::make()
            ->success()
            ->title(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.notification.title'))
            ->body(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.notification.body'));
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->action(function (ProductSupplier $record) {
                    try {
                        $record->delete();
                    } catch (QueryException $e) {
                        Notification::make()
                            ->danger()
                            ->title(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.header-actions.delete.notification.error.title'))
                            ->body(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.header-actions.delete.notification.error.body'))
                            ->send();
                    }
                })
                ->successNotification(
                    Notification::make()
                        ->success()
                        ->title(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.header-actions.delete.notification.success.title'))
                        ->body(__('purchases::filament/admin/clusters/configurations/resources/vendor-price/pages/edit-vendor-price.header-actions.delete.notification.success.body')),
                ),
        ];
    }
}
