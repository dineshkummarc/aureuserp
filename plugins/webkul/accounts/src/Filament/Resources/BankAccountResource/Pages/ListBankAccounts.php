<?php

namespace Webkul\Account\Filament\Resources\BankAccountResource\Pages;

use Webkul\Account\Filament\Resources\BankAccountResource;
use Webkul\Contact\Filament\Clusters\Configurations\Resources\BankAccountResource\Pages\ManageBankAccounts as BaseManageBankAccounts;

class ListBankAccounts extends BaseManageBankAccounts
{
    protected static string $resource = BankAccountResource::class;
}
