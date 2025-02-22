<?php

namespace Webkul\Sale\Filament\Clusters\Configuration\Resources\OrderTemplateProductResource\Pages;

use Webkul\Sale\Filament\Clusters\Configuration\Resources\OrderTemplateProductResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOrderTemplateProduct extends EditRecord
{
    protected static string $resource = OrderTemplateProductResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make()
                ->icon('heroicon-o-pencil-square'),
            Actions\DeleteAction::make(),
        ];
    }
}
