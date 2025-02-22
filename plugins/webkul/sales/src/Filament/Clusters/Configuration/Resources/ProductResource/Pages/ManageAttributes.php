<?php

namespace Webkul\Sale\Filament\Clusters\Configuration\Resources\ProductResource\Pages;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\SubNavigationPosition;
use Filament\Resources\Pages\ManageRelatedRecords;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Webkul\Product\Models\ProductAttribute;
use Webkul\Sale\Filament\Clusters\Configuration\Resources\ProductAttributeResource;
use Webkul\Sale\Filament\Clusters\Configuration\Resources\ProductResource;

class ManageAttributes extends ManageRelatedRecords
{
    protected static string $resource = ProductResource::class;

    protected static string $relationship = 'attributes';

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    public function getSubNavigationPosition(): SubNavigationPosition
    {
        return SubNavigationPosition::Top;
    }

    public static function getNavigationLabel(): string
    {
        return __('sales::filament/clusters/products/resources/product/pages/manage-attributes.title');
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('attribute_id')
                    ->label(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.form.attribute'))
                    ->required()
                    ->relationship('attribute', 'name')
                    ->searchable()
                    ->preload()
                    ->createOptionForm(fn(Forms\Form $form): Form => ProductAttributeResource::form($form)),
                Forms\Components\Select::make('options')
                    ->label(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.form.values'))
                    ->required()
                    ->relationship(
                        name: 'options',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn(Forms\Get $get, Builder $query) => $query->where('products_attribute_options.attribute_id', $get('attribute_id')),
                    )
                    ->searchable()
                    ->preload()
                    ->multiple(),
            ])
            ->columns(1);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->description(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.description'))
            ->columns([
                Tables\Columns\TextColumn::make('attribute.name')
                    ->label(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.columns.attribute')),
                Tables\Columns\TextColumn::make('values.attributeOption.name')
                    ->label(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.columns.values'))
                    ->badge(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.header-actions.create.label'))
                    ->icon('heroicon-o-plus-circle')
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['creator_id'] = Auth::id();

                        return $data;
                    })
                    ->after(function ($record) {
                        $this->updateOrCreateVariants($record);
                    })
                    ->successNotification(
                        Notification::make()
                            ->success()
                            ->title(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.header-actions.create.notification.title'))
                            ->body(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.header-actions.create.notification.body')),
                    ),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function ($record) {
                        $this->updateOrCreateVariants($record);
                    })
                    ->successNotification(
                        Notification::make()
                            ->success()
                            ->title(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.actions.edit.notification.title'))
                            ->body(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.actions.edit.notification.body')),
                    ),
                Tables\Actions\DeleteAction::make()
                    ->successNotification(
                        Notification::make()
                            ->success()
                            ->title(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.actions.delete.notification.title'))
                            ->body(__('sales::filament/clusters/products/resources/product/pages/manage-attributes.table.actions.delete.notification.body')),
                    ),
            ])
            ->paginated(false);
    }

    protected function updateOrCreateVariants(ProductAttribute $record): void
    {
        $record->values->each(function ($value) use ($record) {
            $value->update([
                'extra_price'  => $value->attributeOption->extra_price,
                'attribute_id' => $record->attribute_id,
                'product_id'   => $record->product_id,
            ]);
        });
    }
}
